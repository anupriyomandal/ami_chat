import BetterSqlite3 from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

let _sqlite: any;
let _db: any;

function getDb() {
  if (!_sqlite) {
    const databasePath = process.env.DATABASE_PATH || "./openchat.db";
    _sqlite = new BetterSqlite3(databasePath);
    _sqlite.pragma("journal_mode = WAL");
    _sqlite.pragma("foreign_keys = ON");
    _db = drizzle(_sqlite);
  }
  return _db;
}

export const db = new Proxy({} as any, {
  get(_target, prop) {
    return getDb()[prop];
  },
});
