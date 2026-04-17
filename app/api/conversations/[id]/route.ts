import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq, asc } from "drizzle-orm";
import { conversations, messages } from "@/db/schema";
import { nanoid } from "nanoid";
import { sql } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;

  const conv = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .get();

  if (!conv) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (conv.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, id))
    .orderBy(asc(messages.createdAt))
    .all();

  return NextResponse.json({ conversation: conv, messages: msgs });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;
  const body = await request.json();

  const conv = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .get();

  if (!conv || conv.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db
    .update(conversations)
    .set({ title: body.title, updatedAt: sql`(unixepoch())` })
    .where(eq(conversations.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireUser();
  const { id } = await params;

  const conv = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, id))
    .get();

  if (!conv || conv.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(conversations).where(eq(conversations.id, id));
  return NextResponse.json({ success: true });
}
