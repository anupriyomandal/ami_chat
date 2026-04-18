import { db } from "../db";
import { enabledModels } from "../db/schema";

const defaultModels = [
  { modelId: "openai/gpt-4o-mini", displayName: "GPT-4o Mini" },
  { modelId: "openai/gpt-4o", displayName: "GPT-4o" },
  { modelId: "anthropic/claude-3.5-sonnet", displayName: "Claude 3.5 Sonnet" },
  { modelId: "anthropic/claude-3.5-haiku", displayName: "Claude 3.5 Haiku" },
  { modelId: "anthropic/claude-3-opus", displayName: "Claude 3 Opus" },
  { modelId: "google/gemini-flash-1.5", displayName: "Gemini Flash 1.5" },
  { modelId: "meta-llama/llama-3.1-70b-instruct", displayName: "Llama 3.1 70B" },
  { modelId: "deepseek/deepseek-chat", displayName: "DeepSeek Chat" },
  { modelId: "mistralai/mistral-large", displayName: "Mistral Large" },
  { modelId: "qwen/qwen-2.5-72b-instruct", displayName: "Qwen 2.5 72B" },
  { modelId: "cohere/command-r-plus", displayName: "Command R+" },
  { modelId: "minimax/minimax-m1:free", displayName: "MiniMax M1 2.5 (Free)" },
  { modelId: "minimax/minimax-m2.5:free", displayName: "MiniMax M2.5 (Free)" },
  { modelId: "nvidia/llama-3.3-nemotron-super-49b-v1:free", displayName: "Nemotron Super 49B (Free)" },
  { modelId: "nvidia/nemotron-3-super-120b-a12b:free", displayName: "Nemotron 3 Super 120B (Free)" },
  { modelId: "google/gemma-4-31b-it:free", displayName: "Gemma 4 31B (Free)" },
];

async function seed() {
  console.log("Seeding enabled models...");
  for (const model of defaultModels) {
    await db.insert(enabledModels).values({
      modelId: model.modelId,
      displayName: model.displayName,
      enabled: true,
    }).onConflictDoNothing();
  }
  console.log("Done.");
}

seed().catch(console.error);
