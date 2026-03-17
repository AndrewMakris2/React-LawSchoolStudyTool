import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getReading } from "../lib/storage";
import { streamChatCompletion, resolveApiKey } from "../lib/groqClient";
import { socraticTutor } from "../lib/prompts";
import { createError } from "../middleware/errorHandler";
import { ChatMessage } from "../types";

const router = Router();

const ChatSchema = z.object({
  readingId: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    })
  ),
  coldCallMode: z.boolean().default(false),
  strictMode: z.boolean().default(false),
  hintRequested: z.boolean().default(false),
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ChatSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const { readingId, messages, coldCallMode, strictMode, hintRequested } = parsed.data;

    const reading = await getReading(readingId);
    if (!reading) return next(createError("Reading not found", 404));

    const typedMessages = messages as ChatMessage[];

    const fullMessages = socraticTutor(reading.content, reading.title, typedMessages, {
      coldCall: coldCallMode,
      strict: strictMode,
      hint: hintRequested,
    });

    const apiKey = resolveApiKey(req.headers["x-groq-api-key"] as string | undefined);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    await streamChatCompletion(
      fullMessages,
      apiKey,
      (chunk) => {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      },
      { temperature: 0.8, maxTokens: 1024 }
    );

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    next(err);
  }
});

export default router;
