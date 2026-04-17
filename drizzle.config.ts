import { defineConfig } from "drizzle-kit";
import path from "path";

const databasePath = process.env.DATABASE_PATH || "./openchat.db";
const dbPath = path.resolve(process.cwd(), databasePath);

export default defineConfig({
  dialect: "sqlite",
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: dbPath,
  },
});
