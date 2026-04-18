import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/db";
import { enabledModels, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchModels } from "@/lib/openrouter";
import { decrypt } from "@/lib/encryption";

let cachedModels: { id: string; name: string }[] | null = null;
let cacheExpiry = 0;

export async function GET() {
  const user = await requireUser();

  const now = Date.now();
  if (cachedModels && now < cacheExpiry) {
    return NextResponse.json(cachedModels);
  }

  const enabled = await db
    .select()
    .from(enabledModels)
    .where(eq(enabledModels.enabled, true))
    .all();

  const enabledIds = new Set(enabled.map((m) => m.modelId));

  // Use env key, fall back to user's personal key
  let apiKey = process.env.OPENROUTER_API_KEY || "";
  if (!apiKey) {
    try {
      const userRecord = await db.select().from(users).where(eq(users.id, user.id)).get();
      if (userRecord?.openrouterKeyEncrypted) {
        apiKey = decrypt(userRecord.openrouterKeyEncrypted);
      }
    } catch {}
  }

  let allModels: { id: string; name: string }[] = [];
  try {
    if (apiKey) {
      allModels = await fetchModels(apiKey);
    }
  } catch {}

  // If we couldn't fetch from OpenRouter, use display names from DB directly
  if (allModels.length === 0 && enabled.length > 0) {
    return NextResponse.json(
      enabled.map((m) => ({ id: m.modelId, name: m.displayName }))
    );
  }

  const filtered = allModels
    .filter((m) => enabledIds.has(m.id))
    .map((m) => ({ id: m.id, name: m.name }));

  if (filtered.length === 0) {
    filtered.push(...enabled.map((m) => ({ id: m.modelId, name: m.displayName })));
  }

  if (filtered.length === 0) {
    filtered.push({ id: "openai/gpt-4o-mini", name: "GPT-4o Mini" });
  }

  cachedModels = filtered;
  cacheExpiry = now + 60 * 60 * 1000;

  return NextResponse.json(filtered);
}
