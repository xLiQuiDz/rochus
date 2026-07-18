const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const { createOrder, getOrderById, listOrders, updateOrderStatus } = require('./db');
const { validateAndPrice } = require('./menu-data');

const PORT = Number(process.env.PORT) || 3000;
const STAFF_PIN = process.env.STAFF_PIN || '2468';
const TABLE_COUNT = Math.max(1, Number(process.env.TABLE_COUNT) || 20);
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const SESSION_COOKIE = 'rochus_staff';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

/** @type {Map<string, number>} token -> expiry */
const sessions = new Map();

/** @type {Set<import('express').Response>} */
const sseClients = new Set();

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());

function createSession() {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

function isAuthed(req) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return false;
  const exp = sessions.get(token);
  if (!exp || exp < Date.now()) {
    sessions.delete(token);
    return false;
  }
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return true;
}

function requireStaff(req, res, next) {
  if (!isAuthed(req)) {
    return res.status(401).json({ error: 'Niet ingelogd' });
  }
  next();
}

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

app.get('/api/config', (_req, res) => {
  res.json({ tableCount: TABLE_COUNT, publicUrl: PUBLIC_URL });
});

app.get('/api/auth/me', (req, res) => {
  res.json({ authenticated: isAuthed(req) });
});

app.post('/api/auth/login', (req, res) => {
  const pin = String(req.body?.pin || '');
  if (pin !== STAFF_PIN) {
    return res.status(401).json({ error: 'Onjuiste PIN' });
  }
  const token = createSession();
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_TTL_MS,
  });
  res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) sessions.delete(token);
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
});

app.post('/api/orders', (req, res) => {
  try {
    const table = Math.floor(Number(req.body?.table));
    if (!Number.isFinite(table) || table < 1 || table > TABLE_COUNT) {
      return res.status(400).json({ error: `Kies een tafel van 1 tot ${TABLE_COUNT}` });
    }

    const note = String(req.body?.note || '')
      .trim()
      .slice(0, 200);

    const priced = validateAndPrice(req.body?.items || []);
    const order = createOrder({ table_number: table, note, priced });
    broadcast('order', order);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Bestelling mislukt' });
  }
});

app.get('/api/orders', requireStaff, (req, res) => {
  const status = req.query.status ? String(req.query.status) : undefined;
  res.json(listOrders({ status }));
});

app.get('/api/orders/stream', requireStaff, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);
  sseClients.add(res);

  const heartbeat = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

app.patch('/api/orders/:id', requireStaff, (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = String(req.body?.status || '');
    const order = updateOrderStatus(id, status);
    if (!order) return res.status(404).json({ error: 'Bestelling niet gevonden' });
    broadcast('order', order);
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message || 'Update mislukt' });
  }
});

app.get('/api/orders/:id', requireStaff, (req, res) => {
  const order = getOrderById(Number(req.params.id));
  if (!order) return res.status(404).json({ error: 'Bestelling niet gevonden' });
  res.json(order);
});

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.get('/bar', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bar.html'));
});

app.get('/qr', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'qr.html'));
});

app.listen(PORT, () => {
  console.log(`Rochus listening on ${PUBLIC_URL} (port ${PORT})`);
  console.log(`Tables: 1–${TABLE_COUNT} · Staff PIN set · DB ready`);
});
