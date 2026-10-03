let Database;
try {
  Database = require('better-sqlite3');
} catch (e) {
  // Built-in node:sqlite adapter for Node.js 22+ / 24+ without C++ build toolchains
  const { DatabaseSync } = require('node:sqlite');
  Database = class NodeSqliteAdapter {
    constructor(filePath) {
      this._db = new DatabaseSync(filePath);
    }
    exec(sql) {
      return this._db.exec(sql);
    }
    pragma(sql) {
      return this._db.exec(`PRAGMA ${sql};`);
    }
    prepare(sql) {
      const stmt = this._db.prepare(sql);
      return {
        run: (...args) => stmt.run(...args),
        get: (...args) => stmt.get(...args),
        all: (...args) => stmt.all(...args)
      };
    }
  };
}

const path = require('path');
const fs = require('fs');

let dbInstance = null;

function initDatabase(customPath) {
  const dbPath = customPath || process.env.DATABASE_PATH || path.join(__dirname, '../../data/palette.db');
  
  if (dbPath !== ':memory:') {
    const dir = path.dirname(path.resolve(dbPath));
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  if (dbPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS palettes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      colors TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      palette_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, palette_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (palette_id) REFERENCES palettes(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_palettes_user_id ON palettes(user_id);
    CREATE INDEX IF NOT EXISTS idx_palettes_created_at ON palettes(created_at);
    CREATE INDEX IF NOT EXISTS idx_likes_palette_id ON likes(palette_id);
    CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
  `);

  return db;
}

function getDb(customPath) {
  if (customPath) {
    dbInstance = initDatabase(customPath);
    return dbInstance;
  }
  if (!dbInstance) {
    dbInstance = initDatabase();
  }
  return dbInstance;
}

module.exports = {
  getDb,
  initDatabase
};
