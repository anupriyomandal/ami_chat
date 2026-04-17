import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/db";
import { enabledModels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchModels } from "@/lib/openrouter";

let cachedModels: { id: string; name: string }[] | null = null;
let cacheExpiry = 0;

export async function GET() {
  await requireUser();

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

  let allModels: { id: string; name: string }[] = [];
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || "";
    if (apiKey) {
      allModels = await fetchModels(apiKey);
    }
  } catch {}

  const filtered = allModels
    .filter((m) => enabledIds.has(m.id))
    .map((m) => ({ id: m.id, name: m.name }));

  if (filtered.length === 0) {
    filtered.push({ id: "openai/gpt-4o-mini", name: "GPT-4o Mini" });
  }

  cachedModels = filtered;
  cacheExpiry = now + 60 * 60 * 1000;

  return NextResponse.json(filtered);
}
