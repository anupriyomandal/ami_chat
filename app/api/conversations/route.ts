import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { conversations } from "@/db/schema";
import { nanoid } from "nanoid";

export async function GET() {
  const user = await requireUser();

  const convs = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, user.id))
    .orderBy(desc(conversations.updatedAt))
    .all();

  return NextResponse.json(convs);
}

export async function POST() {
  const user = await requireUser();

  const id = nanoid();
  await db.insert(conversations).values({
    id,
    userId: user.id,
    title: "New Chat",
  });

  const conv = await db.select().from(conversations).where(eq(conversations.id, id)).get();
  return NextResponse.json(conv);
}
