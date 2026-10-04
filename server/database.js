const Database = require("better-sqlite3");

const db = new Database("almajlis.db");


/* =========================
   MENU TABLE
========================= */

db.prepare(`
  CREATE TABLE IF NOT EXISTS menu (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT,
    description TEXT,
    image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();


/* =========================
   ORDERS TABLE
========================= */

db.prepare(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    customer_name TEXT NOT NULL,

    phone TEXT NOT NULL,

    address TEXT NOT NULL,

    note TEXT,

    items TEXT NOT NULL,

    total REAL NOT NULL,

    status TEXT DEFAULT 'Pending',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();


console.log("Database connected successfully.");

module.exports = db;