import sqlite3 from "sqlite3";
import { open } from "sqlite";

/**
 * Creates and initializes the SQLite database infrastructure
 */
export async function createDatabase() {
  const database = await open({
    filename: "./casecellshop.db",
    driver: sqlite3.Database,
  });

  await database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL CHECK (price >= 0),
        stock INTEGER NOT NULL CHECK (stock >= 0),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        idempotency_key TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL,
        total_amount REAL NOT NULL CHECK (total_amount >= 0),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        unit_price REAL NOT NULL CHECK (unit_price >= 0),

        FOREIGN KEY (order_id)
            REFERENCES orders(id),

        FOREIGN KEY (product_id)
            REFERENCES products(id)
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order_id
        ON order_items(order_id);

    CREATE INDEX IF NOT EXISTS idx_order_items_product_id
        ON order_items(product_id);
  `);

  return database;
}
