import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/db";
import { enabledModels } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchModels } from "@/lib/openrouter";

export async function GET() {
  await requireAdmin();

  const enabled = await db.select().from(enabledModels).all();
  const enabledMap = new Map(enabled.map((m) => [m.modelId, m]));

  let allModels: { id: string; name: string }[] = [];
  try {
    const apiKey = process.env.OPENROUTER_API_KEY || "";
    if (apiKey) {
      allModels = await fetchModels(apiKey);
    }
  } catch {}

  const merged = allModels.map((m) => ({
    modelId: m.id,
    displayName: m.name,
    enabled: enabledMap.get(m.id)?.enabled ?? false,
  }));

  for (const m of enabled) {
    if (!merged.find((x) => x.modelId === m.modelId)) {
      merged.push({
        modelId: m.modelId,
        displayName: m.displayName,
        enabled: m.enabled,
      });
    }
  }

  return NextResponse.json(merged);
}

export async function POST(request: Request) {
  await requireAdmin();
  const body = await request.json();
  const { modelId, enabled } = body as { modelId: string; enabled: boolean };

  const existing = await db.select().from(enabledModels).where(eq(enabledModels.modelId, modelId)).get();
  if (existing) {
    await db.update(enabledModels).set({ enabled }).where(eq(enabledModels.modelId, modelId));
  } else {
    await db.insert(enabledModels).values({ modelId, displayName: modelId, enabled });
  }

  return NextResponse.json({ success: true });
}
