export async function register() {
  // Only run in Node.js runtime (not Edge), and only on the server.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { default: BetterSqlite3 } = await import("better-sqlite3");
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
  const path = await import("path");
  const fs = await import("fs");

  const dbPath = process.env.DATABASE_PATH ?? "./openchat.db";
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const sqlite = new BetterSqlite3(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite);

  const migrationsFolder = path.join(process.cwd(), "db", "migrations");
  console.log(`[startup] Running migrations from ${migrationsFolder} on ${dbPath}`);
  migrate(db, { migrationsFolder });
  console.log("[startup] Migrations complete.");

  sqlite.close();
}
