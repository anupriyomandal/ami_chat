import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/auth-guard";
import { db } from "@/db";
import { eq, asc, sql } from "drizzle-orm";
import { messages, conversations, usageLogs, users } from "@/db/schema";
import { nanoid } from "nanoid";
import { streamChatCompletion, generateTitle } from "@/lib/openrouter";
import { checkChatRateLimit } from "@/lib/rate-limit";
import { decrypt } from "@/lib/encryption";

export async function POST(request: Request) {
  const user = await requireUser();

  if (!checkChatRateLimit(user.id)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  const body = await request.json();
  const { conversationId, message, model } = body as { conversationId: string; message: string; model: string };

  if (!conversationId || !message || !model) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const conv = await db.select().from(conversations).where(eq(conversations.id, conversationId)).get();
  if (!conv || conv.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userMsgId = nanoid();
  await db.insert(messages).values({
    id: userMsgId,
    conversationId,
    role: "user",
    content: message,
    model,
  });

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))
    .all();

  const chatMessages = history.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content }));

  let apiKey = process.env.OPENROUTER_API_KEY || "";
  const userRecord = await db.select().from(users).where(eq(users.id, user.id)).get();
  if (userRecord?.openrouterKeyEncrypted) {
    try {
      apiKey = decrypt(userRecord.openrouterKeyEncrypted);
    } catch {}
  }

  if (!apiKey) {
    return NextResponse.json({ error: "No API key configured" }, { status: 500 });
  }

  const openRouterResponse = await streamChatCompletion({
    messages: chatMessages,
    model,
    apiKey,
  });

  const reader = openRouterResponse.body?.getReader();
  if (!reader) {
    return NextResponse.json({ error: "No stream" }, { status: 500 });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let assistantContent = "";
  let usageData: { promptTokens: number; completionTokens: number; totalTokens: number; costUsd: number } | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                assistantContent += delta;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
              }
              if (parsed.usage) {
                usageData = {
                  promptTokens: parsed.usage.prompt_tokens ?? 0,
                  completionTokens: parsed.usage.completion_tokens ?? 0,
                  totalTokens: parsed.usage.total_tokens ?? 0,
                  costUsd: parsed.usage.cost_usd ?? 0,
                };
              }
            } catch {}
          }
        }
      } catch (e) {
        controller.error(e);
      } finally {
        controller.close();

        if (assistantContent) {
          const assistantMsgId = nanoid();
          await db.insert(messages).values({
            id: assistantMsgId,
            conversationId,
            role: "assistant",
            content: assistantContent,
            model,
          });

          await db
            .update(conversations)
            .set({ updatedAt: sql`(unixepoch())` })
            .where(eq(conversations.id, conversationId));

          if (usageData) {
            await db.insert(usageLogs).values({
              id: nanoid(),
              userId: user.id,
              conversationId,
              model,
              promptTokens: usageData.promptTokens,
              completionTokens: usageData.completionTokens,
              totalTokens: usageData.totalTokens,
              costUsd: usageData.costUsd,
            });
          }

          const isFirstExchange = history.filter((m) => m.role === "user").length === 1;
          if (isFirstExchange && conv.title === "New Chat") {
            try {
              const title = await generateTitle(apiKey, message);
              await db
                .update(conversations)
                .set({ title, updatedAt: sql`(unixepoch())` })
                .where(eq(conversations.id, conversationId));
            } catch {}
          }
        }
      }
    },

    cancel() {
      reader.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
