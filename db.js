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

const VALID_STATUSES = new Set(['new', 'preparing', 'served', 'cancelled']);

function mapOrder(row, items = []) {
  return {
    id: Number(row.id),
    table_number: Number(row.table_number),
    status: row.status,
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
      status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'preparing', 'served', 'cancelled')),
      subtotal_cents INTEGER NOT NULL,
      discount_cents INTEGER NOT NULL DEFAULT 0,
      total_cents INTEGER NOT NULL,
      note TEXT,
      client_request_id TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

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

    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_staff_sessions_expires ON staff_sessions(expires_at);
  `);
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

async function createOrder({ table_number, note, priced, client_request_id }) {
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
        (table_number, status, subtotal_cents, discount_cents, total_cents, note, client_request_id)
       VALUES ($1, 'new', $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        table_number,
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

async function listOrders({ status } = {}) {
  let result;
  if (status === 'open') {
    result = await pool.query(
      `SELECT * FROM orders
       WHERE status IN ('new', 'preparing')
       ORDER BY created_at DESC`
    );
  } else if (status) {
    result = await pool.query(
      `SELECT * FROM orders WHERE status = $1 ORDER BY created_at DESC`,
      [status]
    );
  } else {
    result = await pool.query(
      `SELECT * FROM orders ORDER BY created_at DESC LIMIT 100`
    );
  }

  const orders = [];
  for (const row of result.rows) {
    const items = await getOrderItems(pool, row.id);
    orders.push(mapOrder(row, items));
  }
  return orders;
}

async function updateOrderStatus(id, status) {
  if (!VALID_STATUSES.has(status)) {
    throw new Error('Ongeldige status');
  }
  const result = await pool.query(
    `UPDATE orders
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id`,
    [status, id]
  );
  if (!result.rows[0]) return null;
  return getOrderById(id);
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
  listOrders,
  updateOrderStatus,
  createStaffSession,
  touchStaffSession,
  deleteStaffSession,
  cleanupExpiredSessions,
  VALID_STATUSES,
};
