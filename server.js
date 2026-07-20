const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const {
  initDb,
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
  createStaffSession,
  touchStaffSession,
  deleteStaffSession,
  cleanupExpiredSessions,
  listOutOfStock,
  getOutOfStockSet,
  setItemOutOfStock,
} = require('./db');
const { MENU_ITEMS, getMenuItem, validateAndPrice, getPrintMenu } = require('./menu-data');
const QRCode = require('qrcode');

const PORT = Number(process.env.PORT) || 3000;
const STAFF_PIN = process.env.STAFF_PIN || '4321';
const TABLE_COUNT = Math.max(1, Number(process.env.TABLE_COUNT) || 30);
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const SESSION_COOKIE = 'rochus_staff';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/** @type {Set<import('express').Response>} */
const sseClients = new Set();

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());

function sessionExpiryDate() {
  return new Date(Date.now() + SESSION_TTL_MS);
}

async function createSession() {
  const token = crypto.randomBytes(24).toString('hex');
  await createStaffSession(token, sessionExpiryDate());
  return token;
}

async function isAuthed(req) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return false;
  const ok = await touchStaffSession(token, sessionExpiryDate());
  if (!ok) return false;
  return true;
}

function requireStaff(req, res, next) {
  isAuthed(req)
    .then((ok) => {
      if (!ok) return res.status(401).json({ error: 'Niet ingelogd' });
      next();
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: 'Auth-fout' });
    });
}

function broadcast(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of [...sseClients]) {
    try {
      client.write(payload);
      if (typeof client.flush === 'function') client.flush();
    } catch {
      sseClients.delete(client);
    }
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    const { pool } = require('./db');
    await pool.query('SELECT 1');
    res.json({ ok: true, db: true });
  } catch (err) {
    res.status(503).json({ ok: false, db: false, error: err.message });
  }
});

app.get('/api/config', (_req, res) => {
  res.json({ tableCount: TABLE_COUNT, publicUrl: PUBLIC_URL });
});

/** Public: which items are currently out of stock */
app.get('/api/menu/availability', async (_req, res) => {
  try {
    const outOfStock = await listOutOfStock();
    res.set('Cache-Control', 'no-store');
    res.json({ outOfStock });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon voorraad niet laden' });
  }
});

/** Staff: full catalog with availability for the stock panel */
app.get('/api/menu', requireStaff, async (_req, res) => {
  try {
    const oos = await getOutOfStockSet();
    const items = MENU_ITEMS.map((item) => ({
      name: item.name,
      price: item.price,
      category: item.category,
      outOfStock: oos.has(item.name),
    }));
    res.set('Cache-Control', 'no-store');
    res.json({ items, outOfStock: [...oos] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon menu niet laden' });
  }
});

/** Staff: mark a catalog item available / out of stock */
app.patch('/api/menu/availability', requireStaff, async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const outOfStock = Boolean(req.body?.outOfStock);
    if (!getMenuItem(name)) {
      return res.status(400).json({ error: 'Onbekend product' });
    }
    const list = await setItemOutOfStock(name, outOfStock);
    const payload = { outOfStock: list };
    broadcast('availability', payload);
    res.json(payload);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Voorraad-update mislukt' });
  }
});

/** Staff: print-ready catalog (wines collapsed to glas/fles) */
app.get('/api/menu/print', requireStaff, (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.json(getPrintMenu());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon printmenu niet laden' });
  }
});

/** PNG QR for table N — used on printable stickers */
app.get('/api/qr/:table', async (req, res) => {
  try {
    const table = Number(String(req.params.table).replace(/\.png$/i, ''));
    if (!Number.isFinite(table) || table < 1 || table > TABLE_COUNT) {
      return res.status(404).send('Onbekende tafel');
    }
    const url = `${PUBLIC_URL}/?t=${table}`;
    const png = await QRCode.toBuffer(url, {
      type: 'png',
      width: 440,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#1a1208', light: '#fffaf2' },
    });
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400',
    });
    res.send(png);
  } catch (err) {
    console.error(err);
    res.status(500).send('QR-fout');
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    res.json({ authenticated: await isAuthed(req) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ authenticated: false });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const pin = String(req.body?.pin || '');
    if (pin !== STAFF_PIN) {
      return res.status(401).json({ error: 'Onjuiste PIN' });
    }
    const token = await createSession();
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_TTL_MS,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login mislukt' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = req.cookies?.[SESSION_COOKIE];
    if (token) await deleteStaffSession(token);
    res.clearCookie(SESSION_COOKIE);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.clearCookie(SESSION_COOKIE);
    res.json({ ok: true });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const table = Math.floor(Number(req.body?.table));
    if (!Number.isFinite(table) || table < 1 || table > TABLE_COUNT) {
      return res.status(400).json({ error: `Kies een tafel van 1 tot ${TABLE_COUNT}` });
    }

    const note = String(req.body?.note || '')
      .trim()
      .slice(0, 200);

    const clientRequestId = String(req.body?.client_request_id || '')
      .trim()
      .slice(0, 64);

    const priced = validateAndPrice(req.body?.items || []);
    const oos = await getOutOfStockSet();
    const blocked = priced.items.find((item) => oos.has(item.name));
    if (blocked) {
      return res.status(409).json({
        error: `${blocked.name} is uitverkocht`,
        outOfStock: [...oos],
      });
    }

    const order = await createOrder({
      table_number: table,
      note,
      priced,
      client_request_id: clientRequestId || null,
    });
    broadcast('order', order);
    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Bestelling mislukt' });
  }
});

app.get('/api/orders', requireStaff, async (req, res) => {
  try {
    const status = req.query.status ? String(req.query.status) : undefined;
    res.json(await listOrders({ status }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon bestellingen niet laden' });
  }
});

app.get('/api/orders/stream', requireStaff, (req, res) => {
  req.socket.setTimeout(0);
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Pad first chunk so some proxies flush immediately
  res.write(`:${' '.repeat(2048)}\n\n`);
  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true, at: Date.now() })}\n\n`);
  if (typeof res.flush === 'function') res.flush();
  sseClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(`: ping ${Date.now()}\n\n`);
      if (typeof res.flush === 'function') res.flush();
    } catch {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
});

app.patch('/api/orders/:id', requireStaff, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = String(req.body?.status || '');
    const order = await updateOrderStatus(id, status);
    if (!order) return res.status(404).json({ error: 'Bestelling niet gevonden' });
    broadcast('order', order);
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Update mislukt' });
  }
});

app.get('/api/orders/:id', requireStaff, async (req, res) => {
  try {
    const order = await getOrderById(Number(req.params.id));
    if (!order) return res.status(404).json({ error: 'Bestelling niet gevonden' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon bestelling niet laden' });
  }
});

app.get('/vendor/confetti.browser.min.js', (_req, res) => {
  res.type('application/javascript');
  res.sendFile(
    path.join(__dirname, 'node_modules', 'canvas-confetti', 'dist', 'confetti.browser.js')
  );
});

app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

app.get('/bar', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'bar.html'));
});

app.get('/qr', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'qr.html'));
});

app.get('/print', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'print.html'));
});

async function start() {
  await initDb();
  await cleanupExpiredSessions();
  setInterval(() => {
    cleanupExpiredSessions().catch((err) => console.error(err));
  }, 60 * 60 * 1000);

  app.listen(PORT, () => {
    console.log(`Rochus listening on ${PUBLIC_URL} (port ${PORT})`);
    console.log(`Tables: 1–${TABLE_COUNT} · Postgres ready`);
  });
}

start().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});
