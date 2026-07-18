const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'rochus.db');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_number INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'new'
      CHECK (status IN ('new', 'preparing', 'served', 'cancelled')),
    subtotal_cents INTEGER NOT NULL,
    discount_cents INTEGER NOT NULL DEFAULT 0,
    total_cents INTEGER NOT NULL,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    unit_price_cents INTEGER NOT NULL,
    qty INTEGER NOT NULL,
    category TEXT NOT NULL,
    free_qty INTEGER NOT NULL DEFAULT 0
  );

  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
`);

function mapOrder(row, items = []) {
  return {
    id: row.id,
    table_number: row.table_number,
    status: row.status,
    subtotal_cents: row.subtotal_cents,
    discount_cents: row.discount_cents,
    total_cents: row.total_cents,
    note: row.note || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
    items: items.map((item) => ({
      id: item.id,
      name: item.name,
      unit_price_cents: item.unit_price_cents,
      qty: item.qty,
      category: item.category,
      free_qty: item.free_qty,
    })),
  };
}

function getOrderItems(orderId) {
  return db
    .prepare(
      `SELECT id, name, unit_price_cents, qty, category, free_qty
       FROM order_items WHERE order_id = ? ORDER BY id`
    )
    .all(orderId);
}

function getOrderById(id) {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!row) return null;
  return mapOrder(row, getOrderItems(id));
}

function createOrder({ table_number, note, priced }) {
  const insertOrder = db.prepare(`
    INSERT INTO orders (table_number, status, subtotal_cents, discount_cents, total_cents, note)
    VALUES (?, 'new', ?, ?, ?, ?)
  `);
  const insertItem = db.prepare(`
    INSERT INTO order_items (order_id, name, unit_price_cents, qty, category, free_qty)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    const result = insertOrder.run(
      table_number,
      priced.subtotal_cents,
      priced.discount_cents,
      priced.total_cents,
      note || null
    );
    const orderId = result.lastInsertRowid;
    for (const item of priced.items) {
      insertItem.run(
        orderId,
        item.name,
        item.unit_price_cents,
        item.qty,
        item.category,
        item.free_qty
      );
    }
    return orderId;
  });

  return getOrderById(tx());
}

function listOrders({ status } = {}) {
  let rows;
  if (status === 'open') {
    rows = db
      .prepare(
        `SELECT * FROM orders
         WHERE status IN ('new', 'preparing')
         ORDER BY created_at DESC`
      )
      .all();
  } else if (status) {
    rows = db
      .prepare(`SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC`)
      .all(status);
  } else {
    rows = db
      .prepare(`SELECT * FROM orders ORDER BY created_at DESC LIMIT 100`)
      .all();
  }
  return rows.map((row) => mapOrder(row, getOrderItems(row.id)));
}

const VALID_STATUSES = new Set(['new', 'preparing', 'served', 'cancelled']);

function updateOrderStatus(id, status) {
  if (!VALID_STATUSES.has(status)) {
    throw new Error('Ongeldige status');
  }
  const result = db
    .prepare(
      `UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`
    )
    .run(status, id);
  if (result.changes === 0) return null;
  return getOrderById(id);
}

module.exports = {
  db,
  DB_PATH,
  createOrder,
  getOrderById,
  listOrders,
  updateOrderStatus,
  VALID_STATUSES,
};
