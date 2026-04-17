const OPENROUTER_API = "https://openrouter.ai/api/v1";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface StreamChatOptions {
  messages: ChatMessage[];
  model: string;
  apiKey: string;
  signal?: AbortSignal;
}

export async function streamChatCompletion({ messages, model, apiKey, signal }: StreamChatOptions) {
  const response = await fetch(`${OPENROUTER_API}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "AMIChat",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} ${error}`);
  }

  return response;
}

export async function fetchModels(apiKey: string) {
  const response = await fetch(`${OPENROUTER_API}/models`, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "AMIChat",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  const data = await response.json();
  return data.data as { id: string; name: string }[];
}

export async function generateTitle(apiKey: string, firstMessage: string): Promise<string> {
  const response = await fetch(`${OPENROUTER_API}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "AMIChat",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Generate a concise 3-6 word title for a chat conversation based on the user's first message. Return ONLY the title, nothing else.",
        },
        {
          role: "user",
          content: firstMessage,
        },
      ],
      max_tokens: 20,
    }),
  });

  if (!response.ok) return "New Chat";

  const data = await response.json();
  const title = data.choices?.[0]?.message?.content?.trim();
  return title || "New Chat";
}
