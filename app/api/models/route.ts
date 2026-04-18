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

  // Try to get prettier names from OpenRouter, but always show all DB models
  let orNames: Record<string, string> = {};
  try {
    if (apiKey) {
      const orModels = await fetchModels(apiKey);
      for (const m of orModels) orNames[m.id] = m.name;
    }
  } catch {}

  const result = enabled.map((m) => ({
    id: m.modelId,
    name: orNames[m.modelId] ?? m.displayName,
  }));

  if (result.length === 0) {
    result.push({ id: "openai/gpt-4o-mini", name: "GPT-4o Mini" });
  }

  cachedModels = result;
  cacheExpiry = now + 60 * 60 * 1000;

  return NextResponse.json(result);
}
