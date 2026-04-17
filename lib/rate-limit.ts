const chatRateLimits = new Map<string, { count: number; resetAt: number }>();

const CHAT_LIMIT = 30;
const CHAT_WINDOW_MS = 60 * 1000;

export function checkChatRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = chatRateLimits.get(userId);

  if (!entry || now > entry.resetAt) {
    chatRateLimits.set(userId, { count: 1, resetAt: now + CHAT_WINDOW_MS });
    return true;
  }

  if (entry.count >= CHAT_LIMIT) {
    return false;
  }

  entry.count++;
  return true;
}

export function cleanupChatRateLimits() {
  const now = Date.now();
  for (const [key, entry] of chatRateLimits.entries()) {
    if (now > entry.resetAt) {
      chatRateLimits.delete(key);
    }
  }
}

setInterval(cleanupChatRateLimits, CHAT_WINDOW_MS);
