import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/db";
import { users, messages, usageLogs } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  await requireAdmin();

  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt)).all();

  const usersWithStats = allUsers.map((u) => ({
    ...u,
    totalMessages: 0,
    totalTokens: 0,
    totalCost: 0,
  }));

  const msgCounts = await db
    .select({ userId: messages.conversationId, count: sql<number>`count(*)` })
    .from(messages)
    .groupBy(messages.conversationId);

  const tokenStats = await db
    .select({
      userId: usageLogs.userId,
      totalTokens: sql<number>`coalesce(sum(${usageLogs.totalTokens}), 0)`,
      totalCost: sql<number>`coalesce(sum(${usageLogs.costUsd}), 0)`,
    })
    .from(usageLogs)
    .groupBy(usageLogs.userId);

  const tokenMap = new Map(tokenStats.map((s) => [s.userId, { totalTokens: s.totalTokens, totalCost: s.totalCost }]));

  return NextResponse.json(
    usersWithStats.map((u) => ({
      ...u,
      totalTokens: tokenMap.get(u.id)?.totalTokens ?? 0,
      totalCost: tokenMap.get(u.id)?.totalCost ?? 0,
    }))
  );
}
