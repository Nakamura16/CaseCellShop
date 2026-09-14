import sqlite3 from "sqlite3";
import { open } from "sqlite";

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
  `);

  return database;
}
