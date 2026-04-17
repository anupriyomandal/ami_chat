import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import { lucia } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(lucia.sessionCookieName)?.value ?? null;
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
  }
  cookieStore.set(lucia.sessionCookieName, "", lucia.createBlankSessionCookie().attributes);
  return NextResponse.json({ success: true });
}
