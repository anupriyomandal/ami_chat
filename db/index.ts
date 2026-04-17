import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

let _sqlite: Database | undefined;
let _db: ReturnType<typeof drizzle> | undefined;

function getDb() {
  if (!_sqlite) {
    const databasePath = process.env.DATABASE_PATH || "./openchat.db";
    _sqlite = new Database(databasePath);
    _sqlite.pragma("journal_mode = WAL");
    _sqlite.pragma("foreign_keys = ON");
    _db = drizzle(_sqlite);
  }
  return _db!;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof drizzle>];
  },
});
