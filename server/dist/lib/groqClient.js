"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatCompletion = chatCompletion;
exports.streamChatCompletion = streamChatCompletion;
const openai_1 = __importDefault(require("openai"));
const client = new openai_1.default({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});
const MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function chatCompletion(messages, opts = {}) {
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const res = await client.chat.completions.create({
                model: MODEL,
                messages: messages,
                temperature: opts.temperature ?? 0.7,
                max_tokens: opts.maxTokens ?? 2048,
                stream: false,
            });
            const content = res.choices[0]?.message?.content;
            if (!content)
                throw new Error("Empty response from LLM");
            return content;
        }
        catch (err) {
            lastError = err;
            const status = err.status;
            if (status === 429 || (status && status >= 500)) {
                await sleep(BASE_DELAY * Math.pow(2, attempt));
                continue;
            }
            throw err;
        }
    }
    throw lastError ?? new Error("Max retries exceeded");
}
async function streamChatCompletion(messages, onChunk, opts = {}) {
    let lastError = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const stream = await client.chat.completions.create({
                model: MODEL,
                messages: messages,
                temperature: opts.temperature ?? 0.7,
                max_tokens: opts.maxTokens ?? 2048,
                stream: true,
            });
            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta?.content;
                if (delta)
                    onChunk(delta);
            }
            return;
        }
        catch (err) {
            lastError = err;
            const status = err.status;
            if (status === 429 || (status && status >= 500)) {
                await sleep(BASE_DELAY * Math.pow(2, attempt));
                continue;
            }
            throw err;
        }
    }
    throw lastError ?? new Error("Max retries exceeded");
}
