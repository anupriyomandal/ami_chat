export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { default: BetterSqlite3 } = await import("better-sqlite3");
  const { drizzle } = await import("drizzle-orm/better-sqlite3");
  const { migrate } = await import("drizzle-orm/better-sqlite3/migrator");
  const { sql } = await import("drizzle-orm");
  const path = await import("path");
  const fs = await import("fs");

  const dbPath = process.env.DATABASE_PATH ?? "./openchat.db";
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const sqlite = new BetterSqlite3(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  const db = drizzle(sqlite);

  // Run migrations
  const migrationsFolder = path.join(process.cwd(), "db", "migrations");
  console.log(`[startup] Running migrations on ${dbPath}`);
  migrate(db, { migrationsFolder });
  console.log("[startup] Migrations complete.");

  // Inline seed — no child process, no tsx dependency at runtime
  const { enabledModels } = await import("./db/schema");

  const defaultModels = [
    { modelId: "openai/gpt-4o-mini",                          displayName: "GPT-4o Mini" },
    { modelId: "openai/gpt-4o",                               displayName: "GPT-4o" },
    { modelId: "anthropic/claude-3.5-sonnet",                 displayName: "Claude 3.5 Sonnet" },
    { modelId: "anthropic/claude-3.5-haiku",                  displayName: "Claude 3.5 Haiku" },
    { modelId: "anthropic/claude-3-opus",                     displayName: "Claude 3 Opus" },
    { modelId: "google/gemini-flash-1.5",                     displayName: "Gemini Flash 1.5" },
    { modelId: "meta-llama/llama-3.1-70b-instruct",           displayName: "Llama 3.1 70B" },
    { modelId: "deepseek/deepseek-chat",                      displayName: "DeepSeek Chat" },
    { modelId: "mistralai/mistral-large",                     displayName: "Mistral Large" },
    { modelId: "qwen/qwen-2.5-72b-instruct",                  displayName: "Qwen 2.5 72B" },
    { modelId: "cohere/command-r-plus",                       displayName: "Command R+" },
    { modelId: "minimax/minimax-m1:free",                     displayName: "MiniMax M1 2.5 (Free)" },
    { modelId: "minimax/minimax-m2.5:free",                   displayName: "MiniMax M2.5 (Free)" },
    { modelId: "nvidia/llama-3.3-nemotron-super-49b-v1:free", displayName: "Nemotron Super 49B (Free)" },
    { modelId: "nvidia/nemotron-3-super-120b-a12b:free",      displayName: "Nemotron 3 Super 120B (Free)" },
    { modelId: "google/gemma-4-31b-it:free",                  displayName: "Gemma 4 31B (Free)" },
  ];

  for (const model of defaultModels) {
    db.insert(enabledModels).values({
      modelId: model.modelId,
      displayName: model.displayName,
      enabled: true,
    }).onConflictDoNothing().run();
  }
  console.log("[startup] Models seeded.");

  sqlite.close();
}
