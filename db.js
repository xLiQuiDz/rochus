const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.warn('DATABASE_URL is not set — waiting for Postgres connection string');
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
  max: 10,
});

const VALID_STATUSES = new Set([
  'awaiting_payment',
  'new',
  'preparing',
  'served',
  'cancelled',
]);
const STAFF_VISIBLE_STATUSES = new Set(['new', 'preparing', 'served', 'cancelled']);
const VALID_PAYMENT_METHODS = new Set(['cash', 'payconiq']);
const VALID_PAYMENT_STATUSES = new Set(['pending', 'succeeded', 'failed', 'expired', 'none']);

function mapOrder(row, items = []) {
  return {
    id: Number(row.id),
    table_number: Number(row.table_number),
    status: row.status,
    payment_method: row.payment_method || 'cash',
    payment_id: row.payment_id || null,
    payment_status: row.payment_status || (row.payment_method === 'payconiq' ? 'pending' : 'none'),
    paid_at: row.paid_at || null,
    subtotal_cents: Number(row.subtotal_cents),
    discount_cents: Number(row.discount_cents),
    total_cents: Number(row.total_cents),
    note: row.note || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
    items: items.map((item) => ({
      id: Number(item.id),
      name: item.name,
      unit_price_cents: Number(item.unit_price_cents),
      qty: Number(item.qty),
      category: item.category,
      free_qty: Number(item.free_qty),
    })),
  };
}

async function initDb() {
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id BIGSERIAL PRIMARY KEY,
      table_number INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      payment_method TEXT NOT NULL DEFAULT 'cash',
      payment_id TEXT,
      payment_status TEXT NOT NULL DEFAULT 'none',
      paid_at TIMESTAMPTZ,
      subtotal_cents INTEGER NOT NULL,
      discount_cents INTEGER NOT NULL DEFAULT 0,
      total_cents INTEGER NOT NULL,
      note TEXT,
      client_request_id TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cash';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_id TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'none';
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
    ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (status IN ('awaiting_payment', 'new', 'preparing', 'served', 'cancelled'));

    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
    ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check
      CHECK (payment_method IN ('cash', 'payconiq'));

    ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
    ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check
      CHECK (payment_status IN ('none', 'pending', 'succeeded', 'failed', 'expired'));

    CREATE TABLE IF NOT EXISTS order_items (
      id BIGSERIAL PRIMARY KEY,
      order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      category TEXT NOT NULL,
      free_qty INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS staff_sessions (
      token TEXT PRIMARY KEY,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS menu_availability (
      item_name TEXT PRIMARY KEY,
      out_of_stock BOOLEAN NOT NULL DEFAULT false,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id)
      WHERE payment_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_staff_sessions_expires ON staff_sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_menu_availability_oos
      ON menu_availability(item_name) WHERE out_of_stock = true;
  `);
}

/** @returns {Promise<string[]>} */
async function listOutOfStock() {
  const { rows } = await pool.query(
    `SELECT item_name FROM menu_availability
     WHERE out_of_stock = true
     ORDER BY item_name`
  );
  return rows.map((r) => r.item_name);
}

/** @returns {Promise<Set<string>>} */
async function getOutOfStockSet() {
  return new Set(await listOutOfStock());
}

/**
 * @param {string} itemName
 * @param {boolean} outOfStock
 */
async function setItemOutOfStock(itemName, outOfStock) {
  const name = String(itemName || '').trim();
  if (!name) throw new Error('Productnaam ontbreekt');

  if (!outOfStock) {
    await pool.query('DELETE FROM menu_availability WHERE item_name = $1', [name]);
  } else {
    await pool.query(
      `INSERT INTO menu_availability (item_name, out_of_stock, updated_at)
       VALUES ($1, true, NOW())
       ON CONFLICT (item_name) DO UPDATE
         SET out_of_stock = true, updated_at = NOW()`,
      [name]
    );
  }

  return listOutOfStock();
}

async function getOrderItems(client, orderId) {
  const { rows } = await client.query(
    `SELECT id, name, unit_price_cents, qty, category, free_qty
     FROM order_items WHERE order_id = $1 ORDER BY id`,
    [orderId]
  );
  return rows;
}

async function getOrderById(id) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (!rows[0]) return null;
    const items = await getOrderItems(client, id);
    return mapOrder(rows[0], items);
  } finally {
    client.release();
  }
}

/** Minimal lookup for the public guest-tracking endpoint — no items, no amounts. */
async function getOrderPublicStatus(id) {
  const { rows } = await pool.query(
    `SELECT id, table_number, status, payment_method, payment_status, paid_at
     FROM orders WHERE id = $1`,
    [id]
  );
  if (!rows[0]) return null;
  return {
    id: Number(rows[0].id),
    table_number: Number(rows[0].table_number),
    status: rows[0].status,
    payment_method: rows[0].payment_method || 'cash',
    payment_status: rows[0].payment_status || 'none',
    paid_at: rows[0].paid_at || null,
  };
}

async function createOrder({
  table_number,
  note,
  priced,
  client_request_id,
  payment_method,
  status,
  payment_status,
}) {
  const method = VALID_PAYMENT_METHODS.has(payment_method) ? payment_method : 'cash';
  const initialStatus =
    status && VALID_STATUSES.has(status)
      ? status
      : method === 'payconiq'
        ? 'awaiting_payment'
        : 'new';
  const initialPayStatus =
    payment_status && VALID_PAYMENT_STATUSES.has(payment_status)
      ? payment_status
      : method === 'payconiq'
        ? 'pending'
        : 'none';

  if (client_request_id) {
    const existing = await pool.query(
      'SELECT id FROM orders WHERE client_request_id = $1',
      [client_request_id]
    );
    if (existing.rows[0]) {
      return getOrderById(existing.rows[0].id);
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders
        (table_number, status, payment_method, payment_status,
         subtotal_cents, discount_cents, total_cents, note, client_request_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        table_number,
        initialStatus,
        method,
        initialPayStatus,
        priced.subtotal_cents,
        priced.discount_cents,
        priced.total_cents,
        note || null,
        client_request_id || null,
      ]
    );

    const orderRow = orderResult.rows[0];

    for (const item of priced.items) {
      await client.query(
        `INSERT INTO order_items
          (order_id, name, unit_price_cents, qty, category, free_qty)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          orderRow.id,
          item.name,
          item.unit_price_cents,
          item.qty,
          item.category,
          item.free_qty,
        ]
      );
    }

    await client.query('COMMIT');
    const items = await getOrderItems(client, orderRow.id);
    return mapOrder(orderRow, items);
  } catch (err) {
    await client.query('ROLLBACK');
    // Unique violation on idempotency key → return existing
    if (err.code === '23505' && client_request_id) {
      const existing = await pool.query(
        'SELECT id FROM orders WHERE client_request_id = $1',
        [client_request_id]
      );
      if (existing.rows[0]) return getOrderById(existing.rows[0].id);
    }
    throw err;
  } finally {
    client.release();
  }
}

async function attachPaymentToOrder(orderId, { payment_id, payment_status = 'pending' }) {
  const result = await pool.query(
    `UPDATE orders
     SET payment_id = $2,
         payment_status = $3,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [orderId, payment_id, payment_status]
  );
  if (!result.rows[0]) return null;
  return getOrderById(orderId);
}

async function getOrderByPaymentId(paymentId) {
  const id = String(paymentId || '').trim();
  if (!id) return null;
  const { rows } = await pool.query('SELECT id FROM orders WHERE payment_id = $1 LIMIT 1', [id]);
  if (!rows[0]) return null;
  return getOrderById(rows[0].id);
}

/**
 * Mark Bancontact order paid (idempotent). Returns { order, newlyPaid }.
 */
async function markOrderPaid(orderId, { payment_id, expected_cents } = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [orderId]);
    const row = rows[0];
    if (!row) {
      await client.query('ROLLBACK');
      return null;
    }

    if (payment_id && row.payment_id && row.payment_id !== payment_id) {
      await client.query('ROLLBACK');
      throw new Error('payment_id komt niet overeen');
    }
    if (
      Number.isFinite(expected_cents) &&
      Number(row.total_cents) !== Number(expected_cents)
    ) {
      await client.query('ROLLBACK');
      throw new Error('Betaald bedrag komt niet overeen met de bestelling');
    }

    if (row.payment_status === 'succeeded' && row.status !== 'awaiting_payment') {
      await client.query('COMMIT');
      const order = await getOrderById(orderId);
      return { order, newlyPaid: false };
    }

    const nextStatus = row.status === 'awaiting_payment' ? 'new' : row.status;
    await client.query(
      `UPDATE orders
       SET payment_status = 'succeeded',
           payment_id = COALESCE($2, payment_id),
           paid_at = COALESCE(paid_at, NOW()),
           status = $3,
           updated_at = NOW()
       WHERE id = $1`,
      [orderId, payment_id || null, nextStatus]
    );
    await client.query('COMMIT');
    const order = await getOrderById(orderId);
    return { order, newlyPaid: true };
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      /* ignore */
    }
    throw err;
  } finally {
    client.release();
  }
}

async function updateOrderPaymentStatus(orderId, paymentStatus) {
  if (!VALID_PAYMENT_STATUSES.has(paymentStatus) || paymentStatus === 'none') {
    throw new Error('Ongeldige payment_status');
  }
  if (paymentStatus === 'succeeded') {
    return markOrderPaid(orderId);
  }
  const result = await pool.query(
    `UPDATE orders
     SET payment_status = $2,
         status = CASE
           WHEN $2 IN ('failed', 'expired') AND status = 'awaiting_payment'
             THEN 'cancelled'
           ELSE status
         END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id`,
    [orderId, paymentStatus]
  );
  if (!result.rows[0]) return null;
  return getOrderById(orderId);
}

async function listOrders({ status } = {}) {
  let result;
  if (status === 'open') {
    result = await pool.query(
      `SELECT * FROM orders
       WHERE status IN ('new', 'preparing')
       ORDER BY created_at DESC`
    );
  } else if (status && VALID_STATUSES.has(status)) {
    result = await pool.query(
      `SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC`,
      [status]
    );
  } else {
    // Default staff feed: never include unpaid Bancontact holds
    result = await pool.query(
      `SELECT * FROM orders
       WHERE status <> 'awaiting_payment'
       ORDER BY created_at DESC
       LIMIT 100`
    );
  }

  if (result.rows.length === 0) return [];

  // Eén query voor alle line items i.p.v. één per order
  const ids = result.rows.map((row) => Number(row.id));
  const { rows: itemRows } = await pool.query(
    `SELECT id, order_id, name, unit_price_cents, qty, category, free_qty
     FROM order_items WHERE order_id = ANY($1::bigint[]) ORDER BY id`,
    [ids]
  );
  const itemsByOrder = new Map();
  for (const item of itemRows) {
    const key = Number(item.order_id);
    if (!itemsByOrder.has(key)) itemsByOrder.set(key, []);
    itemsByOrder.get(key).push(item);
  }

  return result.rows.map((row) => mapOrder(row, itemsByOrder.get(Number(row.id)) || []));
}

async function updateOrderStatus(id, status) {
  if (!STAFF_VISIBLE_STATUSES.has(status)) {
    throw new Error('Ongeldige status');
  }
  const result = await pool.query(
    `UPDATE orders
     SET status = $1, updated_at = NOW()
     WHERE id = $2 AND status <> 'awaiting_payment'
     RETURNING id`,
    [status, id]
  );
  if (!result.rows[0]) return null;
  return getOrderById(id);
}

/** Today's totals (Europe/Brussels day) for the staff dashboard. */
async function getTodayStats() {
  const totals = await pool.query(
    `SELECT COUNT(*)::int AS orders,
            COALESCE(SUM(total_cents), 0)::int AS revenue_cents,
            COALESCE(SUM(total_cents) FILTER (WHERE payment_method = 'payconiq'), 0)::int
              AS payconiq_cents
     FROM orders
     WHERE status NOT IN ('cancelled', 'awaiting_payment')
       AND (created_at AT TIME ZONE 'Europe/Brussels')::date =
           (NOW() AT TIME ZONE 'Europe/Brussels')::date`
  );
  const top = await pool.query(
    `SELECT oi.name, SUM(oi.qty)::int AS qty
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.status NOT IN ('cancelled', 'awaiting_payment')
       AND (o.created_at AT TIME ZONE 'Europe/Brussels')::date =
           (NOW() AT TIME ZONE 'Europe/Brussels')::date
     GROUP BY oi.name
     ORDER BY qty DESC, oi.name
     LIMIT 3`
  );
  return {
    orders: totals.rows[0].orders,
    revenue_cents: totals.rows[0].revenue_cents,
    payconiq_cents: totals.rows[0].payconiq_cents,
    top: top.rows.map((r) => ({ name: r.name, qty: Number(r.qty) })),
  };
}

/* ============================================================
   Transacties & analyse
   ============================================================ */

/** Whitelist — deze fragmenten gaan rechtstreeks in SQL, dus nooit user input. */
const RANGE_SQL = {
  today:
    "(o.created_at AT TIME ZONE 'Europe/Brussels')::date = (NOW() AT TIME ZONE 'Europe/Brussels')::date",
  yesterday:
    "(o.created_at AT TIME ZONE 'Europe/Brussels')::date = (NOW() AT TIME ZONE 'Europe/Brussels')::date - 1",
  '7d': "o.created_at >= NOW() - INTERVAL '7 days'",
  '30d': "o.created_at >= NOW() - INTERVAL '30 days'",
  all: 'TRUE',
};

function rangeClause(range) {
  return RANGE_SQL[range] || RANGE_SQL.today;
}

/** Per uur groeperen bij één dag, per dag bij langere periodes. */
function bucketsByHour(range) {
  return range === 'today' || range === 'yesterday';
}

/**
 * Transactielijst met filters en paginering.
 * @param {{range?:string,status?:string,payment?:string,table?:number,limit?:number,offset?:number}} opts
 */
async function listTransactions(opts = {}) {
  const where = [rangeClause(opts.range)];
  const params = [];

  if (opts.status && STAFF_VISIBLE_STATUSES.has(opts.status)) {
    params.push(opts.status);
    where.push(`o.status = $${params.length}`);
  } else {
    // Hide unpaid Bancontact holds from the ledger unless explicitly requested
    where.push(`o.status <> 'awaiting_payment'`);
  }
  if (opts.payment && VALID_PAYMENT_METHODS.has(opts.payment)) {
    params.push(opts.payment);
    where.push(`o.payment_method = $${params.length}`);
  }
  if (Number.isInteger(opts.table) && opts.table > 0) {
    params.push(opts.table);
    where.push(`o.table_number = $${params.length}`);
  }

  const whereSql = where.join(' AND ');
  const limit = Math.min(500, Math.max(1, Number(opts.limit) || 100));
  const offset = Math.max(0, Number(opts.offset) || 0);

  const totals = await pool.query(
    `SELECT COUNT(*)::int AS total,
            COALESCE(SUM(o.total_cents) FILTER (WHERE o.status NOT IN ('cancelled', 'awaiting_payment')), 0)::int AS revenue_cents
     FROM orders o WHERE ${whereSql}`,
    params
  );

  const { rows } = await pool.query(
    `SELECT * FROM orders o
     WHERE ${whereSql}
     ORDER BY o.created_at DESC
     LIMIT ${limit} OFFSET ${offset}`,
    params
  );

  if (rows.length === 0) {
    return { total: totals.rows[0].total, revenue_cents: totals.rows[0].revenue_cents, rows: [] };
  }

  const ids = rows.map((r) => Number(r.id));
  const { rows: itemRows } = await pool.query(
    `SELECT id, order_id, name, unit_price_cents, qty, category, free_qty
     FROM order_items WHERE order_id = ANY($1::bigint[]) ORDER BY id`,
    [ids]
  );
  const byOrder = new Map();
  for (const item of itemRows) {
    const key = Number(item.order_id);
    if (!byOrder.has(key)) byOrder.set(key, []);
    byOrder.get(key).push(item);
  }

  return {
    total: totals.rows[0].total,
    revenue_cents: totals.rows[0].revenue_cents,
    rows: rows.map((row) => mapOrder(row, byOrder.get(Number(row.id)) || [])),
  };
}

/** Kerncijfers + reeksen voor de grafieken. */
async function getAnalytics({ range = 'today' } = {}) {
  const clause = rangeClause(range);
  const byHour = bucketsByHour(range);
  const paid = `${clause} AND o.status NOT IN ('cancelled', 'awaiting_payment')`;

  const totals = await pool.query(
    `SELECT COUNT(*) FILTER (WHERE o.status NOT IN ('cancelled', 'awaiting_payment'))::int AS orders,
            COUNT(*) FILTER (WHERE o.status = 'cancelled')::int AS cancelled,
            COALESCE(SUM(o.total_cents) FILTER (WHERE o.status NOT IN ('cancelled', 'awaiting_payment')), 0)::int AS revenue_cents,
            COALESCE(SUM(o.total_cents) FILTER (WHERE o.status NOT IN ('cancelled', 'awaiting_payment') AND o.payment_method = 'payconiq'), 0)::int AS payconiq_cents,
            COALESCE(SUM(o.total_cents) FILTER (WHERE o.status NOT IN ('cancelled', 'awaiting_payment') AND o.payment_method = 'cash'), 0)::int AS cash_cents,
            COUNT(*) FILTER (WHERE o.status NOT IN ('cancelled', 'awaiting_payment') AND o.payment_method = 'payconiq')::int AS payconiq_orders,
            COUNT(*) FILTER (WHERE o.status NOT IN ('cancelled', 'awaiting_payment') AND o.payment_method = 'cash')::int AS cash_orders
     FROM orders o WHERE ${clause}`
  );

  const series = await pool.query(
    byHour
      ? `SELECT date_trunc('hour', o.created_at AT TIME ZONE 'Europe/Brussels') AS bucket,
                COALESCE(SUM(o.total_cents), 0)::int AS revenue_cents,
                COUNT(*)::int AS orders
         FROM orders o WHERE ${paid}
         GROUP BY 1 ORDER BY 1`
      : `SELECT (o.created_at AT TIME ZONE 'Europe/Brussels')::date AS bucket,
                COALESCE(SUM(o.total_cents), 0)::int AS revenue_cents,
                COUNT(*)::int AS orders
         FROM orders o WHERE ${paid}
         GROUP BY 1 ORDER BY 1`
  );

  const items = await pool.query(
    `SELECT oi.name,
            SUM(oi.qty)::int AS qty,
            SUM(oi.unit_price_cents * (oi.qty - oi.free_qty))::int AS revenue_cents
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE ${paid}
     GROUP BY oi.name ORDER BY revenue_cents DESC, oi.name LIMIT 8`
  );

  const categories = await pool.query(
    `SELECT oi.category,
            SUM(oi.qty)::int AS qty,
            SUM(oi.unit_price_cents * (oi.qty - oi.free_qty))::int AS revenue_cents
     FROM order_items oi JOIN orders o ON o.id = oi.order_id
     WHERE ${paid}
     GROUP BY oi.category ORDER BY revenue_cents DESC`
  );

  const tables = await pool.query(
    `SELECT o.table_number::int AS table_number,
            COUNT(*)::int AS orders,
            COALESCE(SUM(o.total_cents), 0)::int AS revenue_cents
     FROM orders o WHERE ${paid}
     GROUP BY 1 ORDER BY revenue_cents DESC LIMIT 6`
  );

  const t = totals.rows[0];
  const itemsSold = items.rows.reduce((sum, r) => sum + Number(r.qty), 0);

  return {
    range,
    unit: byHour ? 'uur' : 'dag',
    totals: {
      orders: t.orders,
      cancelled: t.cancelled,
      revenue_cents: t.revenue_cents,
      avg_cents: t.orders > 0 ? Math.round(t.revenue_cents / t.orders) : 0,
      cash_cents: t.cash_cents,
      payconiq_cents: t.payconiq_cents,
      cash_orders: t.cash_orders,
      payconiq_orders: t.payconiq_orders,
      top_items_sold: itemsSold,
    },
    series: series.rows.map((r) => ({
      bucket: r.bucket instanceof Date ? r.bucket.toISOString() : String(r.bucket),
      revenue_cents: r.revenue_cents,
      orders: r.orders,
    })),
    top_items: items.rows.map((r) => ({
      name: r.name,
      qty: Number(r.qty),
      revenue_cents: r.revenue_cents,
    })),
    categories: categories.rows.map((r) => ({
      category: r.category,
      qty: Number(r.qty),
      revenue_cents: r.revenue_cents,
    })),
    tables: tables.rows.map((r) => ({
      table_number: r.table_number,
      orders: r.orders,
      revenue_cents: r.revenue_cents,
    })),
  };
}

async function createStaffSession(token, expiresAt) {
  await pool.query(
    `INSERT INTO staff_sessions (token, expires_at)
     VALUES ($1, $2)
     ON CONFLICT (token) DO UPDATE SET expires_at = EXCLUDED.expires_at`,
    [token, expiresAt]
  );
}

async function touchStaffSession(token, expiresAt) {
  const result = await pool.query(
    `UPDATE staff_sessions
     SET expires_at = $2
     WHERE token = $1 AND expires_at > NOW()
     RETURNING token`,
    [token, expiresAt]
  );
  return Boolean(result.rows[0]);
}

async function deleteStaffSession(token) {
  await pool.query('DELETE FROM staff_sessions WHERE token = $1', [token]);
}

async function cleanupExpiredSessions() {
  await pool.query('DELETE FROM staff_sessions WHERE expires_at <= NOW()');
}

module.exports = {
  pool,
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
  VALID_STATUSES,
  STAFF_VISIBLE_STATUSES,
  VALID_PAYMENT_METHODS,
  VALID_PAYMENT_STATUSES,
};
