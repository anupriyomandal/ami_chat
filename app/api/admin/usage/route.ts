import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/db";
import { usageLogs, conversations, users, messages } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  await requireAdmin();

  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
  const totalConversations = await db.select({ count: sql<number>`count(*)` }).from(conversations);

  const messages30d = await db
    .select({ count: sql<number>`count(*)` })
    .from(messages)
    .where(sql`${messages.createdAt} > datetime('now', '-30 days')`);

  const tokens30d = await db
    .select({
      totalTokens: sql<number>`coalesce(sum(${usageLogs.totalTokens}), 0)`,
      totalCost: sql<number>`coalesce(sum(${usageLogs.costUsd}), 0)`,
    })
    .from(usageLogs)
    .where(sql`${usageLogs.createdAt} > datetime('now', '-30 days')`);

  const dailyTokens = await db
    .select({
      date: sql<string>`date(${usageLogs.createdAt})`,
      tokens: sql<number>`coalesce(sum(${usageLogs.totalTokens}), 0)`,
    })
    .from(usageLogs)
    .where(sql`${usageLogs.createdAt} > datetime('now', '-30 days')`)
    .groupBy(sql`date(${usageLogs.createdAt})`)
    .orderBy(sql`date(${usageLogs.createdAt})`)
    .all();

  const byModel = await db
    .select({
      model: usageLogs.model,
      tokens: sql<number>`coalesce(sum(${usageLogs.totalTokens}), 0)`,
    })
    .from(usageLogs)
    .groupBy(usageLogs.model)
    .orderBy(desc(sql`sum(${usageLogs.totalTokens})`))
    .limit(10)
    .all();

  const byUser = await db
    .select({
      email: users.email,
      tokens: sql<number>`coalesce(sum(${usageLogs.totalTokens}), 0)`,
    })
    .from(usageLogs)
    .innerJoin(users, eq(usageLogs.userId, users.id))
    .groupBy(usageLogs.userId)
    .orderBy(desc(sql`sum(${usageLogs.totalTokens})`))
    .limit(10)
    .all();

  return NextResponse.json({
    kpis: {
      totalUsers: (totalUsers[0] as any).count,
      totalConversations: (totalConversations[0] as any).count,
      totalMessages30d: (messages30d[0] as any).count,
      totalTokens30d: tokens30d[0]?.totalTokens ?? 0,
      totalCost30d: tokens30d[0]?.totalCost ?? 0,
    },
    dailyTokens,
    byModel,
    byUser,
  });
}
