import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const databasePath = process.env.DATABASE_PATH || "./openchat.db";

export const db = (() => {
  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return drizzle(sqlite);
})();