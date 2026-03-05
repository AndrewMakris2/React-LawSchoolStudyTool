import OpenAI from "openai";
import { ChatMessage } from "../types";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function chatCompletion(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await client.chat.completions.create({
        model: MODEL,
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
  onChunk: (chunk: string) => void,
  opts: { temperature?: number; maxTokens?: number } = {}
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const stream = await client.chat.completions.create({
        model: MODEL,
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