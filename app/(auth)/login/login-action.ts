"use server";

import { verify } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { db } from "@/db";
import { eq, sql } from "drizzle-orm";
import { users, loginAttempts } from "@/db/schema";
import { lucia } from "@/lib/auth";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function loginAction(prevState: string | null, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return "Email and password are required";
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") ?? headersList.get("x-real-ip") ?? "127.0.0.1";

  const recentFailures = await db
    .select()
    .from(loginAttempts)
    .where(
      sql`${loginAttempts.ipAddress} = ${ip} AND ${loginAttempts.success} = 0 AND ${loginAttempts.createdAt} > datetime('now', '-15 minutes')`
    )
    .all();

  if (recentFailures.length >= 5) {
    return "Too many failed attempts. Please try again later.";
  }

  const user = await db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
  if (!user) {
    await db.insert(loginAttempts).values({ id: generateIdFromEntropySize(10), ipAddress: ip, email, success: false });
    return "Invalid email or password";
  }

  const validPassword = await verify(user.passwordHash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  if (!validPassword) {
    await db.insert(loginAttempts).values({ id: generateIdFromEntropySize(10), ipAddress: ip, email, success: false });
    return "Invalid email or password";
  }

  await db.insert(loginAttempts).values({ id: generateIdFromEntropySize(10), ipAddress: ip, email, success: true });
  await db.update(users).set({ lastActiveAt: sql`(unixepoch())` }).where(eq(users.id, user.id));

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  redirect("/chat");
}
