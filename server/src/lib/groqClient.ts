import OpenAI from "openai";
import { ChatMessage } from "../types";

const DEFAULT_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function createGroqClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });
}

export function resolveApiKey(headerKey?: string): string {
  const key = headerKey || process.env.GROQ_API_KEY;
  if (!key) throw Object.assign(new Error("No Groq API key provided. Set your key in the app settings."), { statusCode: 401 });
  return key;
}

export async function chatCompletion(
  messages: ChatMessage[],
  apiKey: string,
  opts: { temperature?: number; maxTokens?: number; model?: string } = {}
): Promise<string> {
  const client = createGroqClient(apiKey);
  const model = opts.model ?? DEFAULT_MODEL;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await client.chat.completions.create({
        model,
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 2048,
        stream: false,
      });
      const content = res.choices[0]?.message?.content;
      if (!content) throw new Error("Empty response from LLM");
      return content;
    } catch (err: unknown) {
      lastError = err as Error;
      const status = (err as { status?: number }).status;
      if (status === 429 || (status && status >= 500)) {
        await sleep(BASE_DELAY * Math.pow(2, attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new Error("Max retries exceeded");
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  apiKey: string,
  onChunk: (chunk: string) => void,
  opts: { temperature?: number; maxTokens?: number; model?: string } = {}
): Promise<void> {
  const client = createGroqClient(apiKey);
  const model = opts.model ?? DEFAULT_MODEL;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const stream = await client.chat.completions.create({
        model,
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 2048,
        stream: true,
      });
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content;
        if (delta) onChunk(delta);
      }
      return;
    } catch (err: unknown) {
      lastError = err as Error;
      const status = (err as { status?: number }).status;
      if (status === 429 || (status && status >= 500)) {
        await sleep(BASE_DELAY * Math.pow(2, attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastError ?? new Error("Max retries exceeded");
}
