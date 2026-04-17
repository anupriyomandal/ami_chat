import { cookies } from "next/headers";
import { lucia } from "./auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) return null;

  const { session, user } = await lucia.validateSession(sessionId);

  if (!session) {
    return null;
  }

  const dbUser = await db.select().from(users).where(eq(users.id, user.id)).get();
  if (!dbUser) return null;

  return { id: user.id, email: user.email, role: dbUser.role, banned: dbUser.banned };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.banned) {
    redirect("/login");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") {
    redirect("/chat");
  }
  return user;
}
