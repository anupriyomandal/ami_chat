import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { encrypt, decrypt } from "@/lib/encryption";

export async function GET() {
  const user = await requireUser();

  const dbUser = await db.select().from(users).where(eq(users.id, user.id)).get();
  const hasKey = !!dbUser?.openrouterKeyEncrypted;
  let masked = "";
  if (hasKey && dbUser?.openrouterKeyEncrypted) {
    try {
      const key = decrypt(dbUser.openrouterKeyEncrypted);
      masked = `****${key.slice(-4)}`;
    } catch {
      masked = "****";
    }
  }

  return NextResponse.json({ hasKey, masked });
}

export async function POST(request: Request) {
  const user = await requireUser();
  const body = await request.json();
  const { key } = body as { key: string };

  if (!key || typeof key !== "string") {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const encrypted = encrypt(key);
  await db.update(users).set({ openrouterKeyEncrypted: encrypted }).where(eq(users.id, user.id));

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const user = await requireUser();
  await db.update(users).set({ openrouterKeyEncrypted: null }).where(eq(users.id, user.id));
  return NextResponse.json({ success: true });
}
