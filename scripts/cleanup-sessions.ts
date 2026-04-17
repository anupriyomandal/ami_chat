import { db } from "../db";
import { sessions } from "../db/schema";
import { lt, sql } from "drizzle-orm";

async function cleanup() {
  console.log("Cleaning up expired sessions...");
  const result = await db.delete(sessions).where(lt(sessions.expiresAt, sql`(unixepoch())`));
  console.log(`Deleted ${result.changes} expired sessions.`);
}

cleanup().catch(console.error);
