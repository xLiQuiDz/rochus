const path = require('path');
const crypto = require('crypto');
const express = require('express');
const cookieParser = require('cookie-parser');
const {
  initDb,
  createOrder,
  getOrderById,
  getOrderByPaymentId,
  getOrderPublicStatus,
  attachPaymentToOrder,
  markOrderPaid,
  updateOrderPaymentStatus,
  listOrders,
  updateOrderStatus,
  createStaffSession,
  touchStaffSession,
  deleteStaffSession,
  cleanupExpiredSessions,
  listOutOfStock,
  getOutOfStockSet,
  setItemOutOfStock,
  getTodayStats,
  listTransactions,
  getAnalytics,
} = require('./db');
const {
  MENU_ITEMS,
  getMenuItem,
  validateAndPrice,
  getPrintMenu,
  getAllergenCard,
} = require('./menu-data');
const bancontact = require('./bancontact');
const QRCode = require('qrcode');

const PORT = Number(process.env.PORT) || 3000;
if (process.env.NODE_ENV === 'production' && !process.env.STAFF_PIN) {
  // Nooit met de in de repo gepubliceerde fallback-PIN live gaan
  throw new Error('STAFF_PIN moet gezet zijn in productie');
}
const STAFF_PIN = process.env.STAFF_PIN || '4321';
const TABLE_COUNT = Math.max(1, Number(process.env.TABLE_COUNT) || 30);
const PUBLIC_URL = (process.env.PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
// Legacy static link — only used if Bancontact API is not configured (dev fallback QR)
const PAYCONIQ_URL = process.env.PAYCONIQ_URL || '';
const SESSION_COOKIE = 'rochus_staff';
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/** @type {Set<import('express').Response>} */
const sseClients = new Set();

const app = express();
app.disable('x-powered-by');
// Railway/reverse proxy: nodig zodat req.ip het echte client-IP is
app.set('trust proxy', 1);

/* Security headers. img-src staat https: toe omdat de Bancontact betaal-QR
   van een extern provider-domein kan komen; style-src 'unsafe-inline' omdat
   de grafieken kleur-swatches via style-attributen zetten. */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self'",
  // canvas-confetti draait zijn animatie in een blob-worker
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');
app.use((_req, res, next) => {
  res.set({
    'Content-Security-Policy': CSP,
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  });
  if (process.env.NODE_ENV === 'production') {
    res.set('Strict-Transport-Security', 'max-age=15552000');
  }
  next();
});
app.use(
  express.json({
    limit: '64kb',
    verify: (req, _res, buf) => {
      // Raw body needed to verify Bancontact detached JWS
      if (req.originalUrl?.startsWith('/api/payments/bancontact/callback')) {
        req.rawBody = buf;
      }
    },
  })
);
app.use(cookieParser());

/* PIN brute-force bescherming — per IP, in-memory.
   20 i.p.v. 10: gasten op de zaak-wifi delen één NAT-IP met de staff. */
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 20;

/* Bestel-flood bescherming — ruim boven een piek via gedeelde venue-wifi,
   ver onder wat een script nodig heeft om de bar te overspoelen. */
const ORDER_WINDOW_MS = 10 * 60 * 1000;
const ORDER_MAX_PER_WINDOW = 60;
/** @type {Map<string, number[]>} */
const orderTimestamps = new Map();

function orderRateLimited(ip) {
  const now = Date.now();
  const cutoff = now - ORDER_WINDOW_MS;
  const list = (orderTimestamps.get(ip) || []).filter((t) => t > cutoff);
  if (list.length >= ORDER_MAX_PER_WINDOW) {
    orderTimestamps.set(ip, list);
    return true;
  }
  list.push(now);
  orderTimestamps.set(ip, list);
  return false;
}
/** @type {Map<string, { count: number, first: number }>} */
const loginFailures = new Map();

function loginRateLimited(ip) {
  const entry = loginFailures.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > LOGIN_WINDOW_MS) {
    loginFailures.delete(ip);
    return false;
  }
  return entry.count >= LOGIN_MAX_FAILURES;
}

function recordLoginFailure(ip) {
  const now = Date.now();
  const entry = loginFailures.get(ip);
  if (!entry || now - entry.first > LOGIN_WINDOW_MS) {
    loginFailures.set(ip, { count: 1, first: now });
  } else {
    entry.count += 1;
  }
}

function pinMatches(pin) {
  // Hash beide kanten: timingSafeEqual eist gelijke lengte, en een vroege
  // length-check zou de PIN-lengte via timing verklappen
  const given = crypto.createHash('sha256').update(String(pin)).digest();
  const expected = crypto.createHash('sha256').update(STAFF_PIN).digest();
  return crypto.timingSafeEqual(given, expected);
}

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
    // Geen err.message naar buiten: kan host/DB-details lekken
    console.error('Health check failed', err);
    res.status(503).json({ ok: false, db: false });
  }
});

app.get('/api/config', (_req, res) => {
  res.json({
    tableCount: TABLE_COUNT,
    publicUrl: PUBLIC_URL,
    bancontactEnabled: bancontact.isConfigured(),
    // Legacy static URL only when API is not configured
    payconiqUrl: bancontact.isConfigured() ? '' : PAYCONIQ_URL,
  });
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

/** Staff: print-ready allergen card */
app.get('/api/menu/allergens', requireStaff, (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.json(getAllergenCard());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon allergieënkaart niet laden' });
  }
});

/** Staff: today's totals for the dashboard header */
app.get('/api/stats/today', requireStaff, async (_req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    res.json(await getTodayStats());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon statistieken niet laden' });
  }
});

const VALID_RANGES = new Set(['today', 'yesterday', '7d', '30d', 'all']);

/** Staff: transactielijst met filters */
app.get('/api/transactions', requireStaff, async (req, res) => {
  try {
    const range = VALID_RANGES.has(String(req.query.range)) ? String(req.query.range) : 'today';
    const table = Number(req.query.table);
    const data = await listTransactions({
      range,
      status: req.query.status ? String(req.query.status) : undefined,
      payment: req.query.payment ? String(req.query.payment) : undefined,
      table: Number.isInteger(table) ? table : undefined,
      limit: Number(req.query.limit) || 200,
      offset: Number(req.query.offset) || 0,
    });
    res.set('Cache-Control', 'no-store');
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon transacties niet laden' });
  }
});

/** Staff: kerncijfers en reeksen voor de grafieken */
app.get('/api/analytics', requireStaff, async (req, res) => {
  try {
    const range = VALID_RANGES.has(String(req.query.range)) ? String(req.query.range) : 'today';
    res.set('Cache-Control', 'no-store');
    res.json(await getAnalytics({ range }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon analyse niet laden' });
  }
});

/** Alleen echte betaaldomeinen — anders is dit een open QR-generator. */
function isPaymentLink(url) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    return (
      host === 'bancontact.net' ||
      host.endsWith('.bancontact.net') ||
      host === 'payconiq.com' ||
      host.endsWith('.payconiq.com')
    );
  } catch {
    return false;
  }
}

/** PNG QR for a Bancontact payment link (dynamic `?u=` or legacy static URL) */
app.get(['/api/qr/payconiq', '/api/qr/payconiq.png'], async (req, res) => {
  try {
    const dynamic = String(req.query.u || '').trim();
    const target = dynamic || PAYCONIQ_URL;
    if (!target || !isPaymentLink(target)) {
      return res.status(404).send('Geen betaallink');
    }
    const png = await QRCode.toBuffer(target, {
      type: 'png',
      width: 440,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: { dark: '#1a1208', light: '#fffaf2' },
    });
    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': dynamic ? 'no-store' : 'public, max-age=86400',
    });
    res.send(png);
  } catch (err) {
    console.error(err);
    res.status(500).send('QR-fout');
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
    const ip = req.ip || 'unknown';
    if (loginRateLimited(ip)) {
      return res.status(429).json({ error: 'Te veel pogingen — probeer over een kwartier opnieuw' });
    }
    const pin = String(req.body?.pin || '');
    if (!pinMatches(pin)) {
      recordLoginFailure(ip);
      return res.status(401).json({ error: 'Onjuiste PIN' });
    }
    loginFailures.delete(ip);
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
    if (orderRateLimited(req.ip || 'unknown')) {
      return res.status(429).json({ error: 'Even rustig aan — probeer zo meteen opnieuw' });
    }
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

    const paymentMethod = req.body?.payment_method === 'payconiq' ? 'payconiq' : 'cash';

    if (paymentMethod === 'payconiq' && !bancontact.isConfigured()) {
      return res.status(503).json({
        error:
          'Bancontact is nog niet geconfigureerd. Kies cash, of vraag de bar om de Bancontact API-key te zetten.',
      });
    }

    const priced = validateAndPrice(req.body?.items || []);
    const oos = await getOutOfStockSet();
    const blocked = priced.items.find((item) => oos.has(item.name));
    if (blocked) {
      return res.status(409).json({
        error: `${blocked.name} is uitverkocht`,
        outOfStock: [...oos],
      });
    }

    if (paymentMethod === 'cash') {
      const order = await createOrder({
        table_number: table,
        note,
        priced,
        client_request_id: clientRequestId || null,
        payment_method: 'cash',
        status: 'new',
        payment_status: 'none',
      });
      broadcast('order', order);
      return res.status(201).json(order);
    }

    // Bancontact: hold order until webhook confirms payment
    let order = await createOrder({
      table_number: table,
      note,
      priced,
      client_request_id: clientRequestId || null,
      payment_method: 'payconiq',
      status: 'awaiting_payment',
      payment_status: 'pending',
    });

    // Terug uit de bank-app: mét tafel + order zodat de menupagina de
    // betaalstatus kan hervatten
    const returnUrl = `${PUBLIC_URL}/?t=${table}&paid=1&order=${order.id}`;

    if (order.payment_status === 'succeeded') {
      return res.status(201).json({
        ...order,
        payment: { id: order.payment_id, status: 'succeeded' },
      });
    }
    if (
      order.status === 'cancelled' ||
      order.payment_status === 'failed' ||
      order.payment_status === 'expired'
    ) {
      return res.status(409).json({
        error: 'Vorige Bancontact-poging is afgelopen — start opnieuw vanuit het mandje',
      });
    }

    // Idempotent replay: if this client_request_id already has a payment, reuse it
    if (order.payment_id && order.payment_status === 'pending') {
      try {
        const existingPay = await bancontact.getPayment(order.payment_id);
        const mapped = bancontact.mapBancontactStatus(existingPay.status);
        if (mapped === 'succeeded') {
          const paid = await markOrderPaid(order.id, {
            payment_id: existingPay.id,
            expected_cents: existingPay.amount,
          });
          if (paid?.newlyPaid) broadcast('order', paid.order);
          return res.status(201).json({
            ...paid.order,
            payment: {
              id: existingPay.id,
              status: 'succeeded',
              deeplink: bancontact.buildReturnDeeplink(existingPay.deeplink, returnUrl),
              checkoutUrl: existingPay.checkoutUrl,
              qrUrl: existingPay.qrUrl,
            },
          });
        }
        return res.status(201).json({
          ...order,
          payment: {
            id: existingPay.id,
            status: mapped,
            deeplink: bancontact.buildReturnDeeplink(existingPay.deeplink, returnUrl),
            checkoutUrl: existingPay.checkoutUrl,
            qrUrl: existingPay.qrUrl,
          },
        });
      } catch {
        /* create a fresh payment below */
      }
    }

    let payment;
    try {
      payment = await bancontact.createPayment({
        amountCents: order.total_cents,
        description: `Rochus tafel ${table}`,
        reference: `T${table}-O${order.id}`.slice(0, 35),
        returnUrl,
      });
    } catch (err) {
      await updateOrderPaymentStatus(order.id, 'failed').catch(() => {});
      throw err;
    }

    order = await attachPaymentToOrder(order.id, {
      payment_id: payment.id,
      payment_status: 'pending',
    });

    // Do NOT broadcast to the bar until paid
    res.status(201).json({
      ...order,
      payment: {
        id: payment.id,
        status: 'pending',
        deeplink: bancontact.buildReturnDeeplink(payment.deeplink, returnUrl),
        checkoutUrl: payment.checkoutUrl,
        qrUrl: payment.qrUrl,
      },
    });
  } catch (err) {
    console.error(err);
    const status = err.code === 'BANCONTACT_NOT_CONFIGURED' ? 503 : 400;
    res.status(status).json({ error: err.message || 'Bestelling mislukt' });
  }
});

/** Bancontact Pro payment status webhook (JWS-signed) */
app.post('/api/payments/bancontact/callback', async (req, res) => {
  try {
    const signature = req.get('signature') || req.get('Signature') || '';
    const raw = req.rawBody || Buffer.from(JSON.stringify(req.body || {}), 'utf8');
    await bancontact.verifyCallbackSignature(signature, raw);

    const body = req.body || {};
    const paymentId = String(body.paymentId || body.id || '');
    const status = bancontact.mapBancontactStatus(body.status);
    const amount = Number(body.amount);

    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId ontbreekt' });
    }

    let order = await getOrderByPaymentId(paymentId);
    if (!order && body.reference) {
      // Fallback: reference like T3-O12
      const m = String(body.reference).match(/O(\d+)/i);
      if (m) order = await getOrderById(Number(m[1]));
    }
    if (!order) {
      // Acknowledge unknown payments so Bancontact stops retrying forever
      console.warn('Bancontact callback for unknown payment', paymentId);
      return res.status(200).json({ ok: true, ignored: true });
    }

    if (status === 'succeeded') {
      if (order.payment_status === 'succeeded' && order.payment_id !== paymentId) {
        // Zelfde order, tweede geslaagde betaling: gast betaalde dubbel
        console.warn(
          `Dubbele betaling voor order ${order.id}: ${order.payment_id} én ${paymentId} — terugbetalen via portal`
        );
      }
      const result = await markOrderPaid(order.id, {
        payment_id: paymentId,
        expected_cents: Number.isFinite(amount) ? amount : undefined,
      });
      if (result?.newlyPaid) broadcast('order', result.order);
      return res.status(200).json({ ok: true, status: 'succeeded' });
    }

    if (status === 'failed' || status === 'expired') {
      await updateOrderPaymentStatus(order.id, status);
      return res.status(200).json({ ok: true, status });
    }

    res.status(200).json({ ok: true, status: 'pending' });
  } catch (err) {
    console.error('Bancontact callback error', err);
    res.status(400).json({ error: err.message || 'Callback afgewezen' });
  }
});

/* Max 1 provider-call per order per 4s, hoe hard gasten (of grappenmakers)
   ook pollen — anders is dit een gratis Bancontact-API-verbruiker. */
const PROVIDER_POLL_MIN_MS = 4000;
/** @type {Map<number, number>} */
const providerPollAt = new Map();

/** Guest: poll Bancontact payment for an order (with API fallback) */
app.get('/api/orders/:id/payment', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(404).json({ error: 'Bestelling niet gevonden' });
    }
    let order = await getOrderById(id);
    if (!order) return res.status(404).json({ error: 'Bestelling niet gevonden' });

    const lastProviderPoll = providerPollAt.get(id) || 0;
    if (
      order.payment_method === 'payconiq' &&
      order.payment_status === 'pending' &&
      order.payment_id &&
      bancontact.isConfigured() &&
      Date.now() - lastProviderPoll >= PROVIDER_POLL_MIN_MS
    ) {
      providerPollAt.set(id, Date.now());
      try {
        const payment = await bancontact.getPayment(order.payment_id);
        const mapped = bancontact.mapBancontactStatus(payment.status);
        if (mapped === 'succeeded') {
          const result = await markOrderPaid(order.id, {
            payment_id: payment.id,
            expected_cents: payment.amount,
          });
          if (result?.newlyPaid) broadcast('order', result.order);
          order = result?.order || order;
        } else if (mapped === 'failed' || mapped === 'expired') {
          order = (await updateOrderPaymentStatus(order.id, mapped)) || order;
        }
      } catch (err) {
        console.warn('Bancontact poll fallback failed', err.message);
      }
    }

    if (order.payment_status !== 'pending') providerPollAt.delete(id);

    // Bewust minimaal: geen bedragen of payment_id op een publiek endpoint
    res.set('Cache-Control', 'no-store');
    res.json({
      id: order.id,
      status: order.status,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      paid_at: order.paid_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon betaalstatus niet laden' });
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

/** Public: guests poll the progress of their own order (status only) */
app.get('/api/orders/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(404).json({ error: 'Bestelling niet gevonden' });
    }
    const status = await getOrderPublicStatus(id);
    if (!status) return res.status(404).json({ error: 'Bestelling niet gevonden' });
    res.set('Cache-Control', 'no-store');
    res.json(status);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Kon status niet laden' });
  }
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

app.get(['/transacties', '/transactions'], (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'transacties.html'));
});

async function initDbWithRetry(attempts = 5, delayMs = 3000) {
  for (let i = 1; i <= attempts; i += 1) {
    try {
      await initDb();
      return;
    } catch (err) {
      if (i === attempts) throw err;
      console.warn(`initDb poging ${i}/${attempts} mislukt (${err.message}) — retry in ${delayMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

async function start() {
  await initDbWithRetry();
  await cleanupExpiredSessions();
  setInterval(() => {
    cleanupExpiredSessions().catch((err) => console.error(err));
    const cutoff = Date.now() - LOGIN_WINDOW_MS;
    for (const [ip, entry] of loginFailures) {
      if (entry.first < cutoff) loginFailures.delete(ip);
    }
    const orderCutoff = Date.now() - ORDER_WINDOW_MS;
    for (const [ip, list] of orderTimestamps) {
      const fresh = list.filter((t) => t > orderCutoff);
      if (fresh.length === 0) orderTimestamps.delete(ip);
      else orderTimestamps.set(ip, fresh);
    }
    const pollCutoff = Date.now() - 60 * 60 * 1000;
    for (const [id, at] of providerPollAt) {
      if (at < pollCutoff) providerPollAt.delete(id);
    }
  }, 60 * 60 * 1000);

  const server = app.listen(PORT, () => {
    console.log(`Rochus listening on ${PUBLIC_URL} (port ${PORT})`);
    console.log(`Tables: 1–${TABLE_COUNT} · Postgres ready`);
  });

  // Railway redeploy: netjes uitbollen i.p.v. midden in een request sterven
  let shuttingDown = false;
  function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} ontvangen — afsluiten…`);
    for (const client of [...sseClients]) {
      try {
        client.end();
      } catch {
        /* ignore */
      }
      sseClients.delete(client);
    }
    server.close(() => {
      const { pool } = require('./db');
      pool
        .end()
        .catch(() => {})
        .finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(0), 8000).unref();
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});
