import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();
  const { action } = body as { action: string };

  const user = await db.select().from(users).where(eq(users.id, id)).get();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  switch (action) {
    case "promote":
      await db.update(users).set({ role: "admin" }).where(eq(users.id, id));
      break;
    case "demote":
      await db.update(users).set({ role: "user" }).where(eq(users.id, id));
      break;
    case "ban":
      await db.update(users).set({ banned: true }).where(eq(users.id, id));
      break;
    case "unban":
      await db.update(users).set({ banned: false }).where(eq(users.id, id));
      break;
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin();
  const { id } = await params;
  await db.delete(users).where(eq(users.id, id));
  return NextResponse.json({ success: true });
}
