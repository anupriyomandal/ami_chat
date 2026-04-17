import BetterSqlite3 from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

type DbType = ReturnType<typeof drizzle>;

let _sqlite: InstanceType<typeof BetterSqlite3> | undefined;
let _db: DbType | undefined;

function getDb(): DbType {
  if (!_sqlite) {
    const databasePath = process.env.DATABASE_PATH || "./openchat.db";
    _sqlite = new BetterSqlite3(databasePath);
    _sqlite.pragma("journal_mode = WAL");
    _sqlite.pragma("foreign_keys = ON");
    _db = drizzle(_sqlite);
  }
  return _db!;
}

export const db = new Proxy({} as DbType, {
  get(_target, prop) {
    return (getDb() as any)[prop];
  },
});
