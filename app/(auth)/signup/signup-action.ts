"use server";

import { hash } from "@node-rs/argon2";
import { generateIdFromEntropySize } from "lucia";
import { db } from "@/db";
import { eq, sql } from "drizzle-orm";
import { users } from "@/db/schema";
import { lucia } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password || !confirmPassword) {
    return { error: "All fields are required" };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Invalid email address" };
  }

  const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
  if (existingUser) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
  const isFirstUser = (userCount[0] as any).count === 0;

  const userId = generateIdFromEntropySize(10);
  await db.insert(users).values({
    id: userId,
    email: email.toLowerCase(),
    passwordHash,
    role: isFirstUser ? "admin" : "user",
  });

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  redirect("/chat");
}
