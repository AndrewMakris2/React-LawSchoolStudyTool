import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { chatCompletion, resolveApiKey } from "../lib/groqClient";
import { glossaryExtractor } from "../lib/prompts";
import { getReading, saveGlossaryEntries, getGlossaryEntries, deleteGlossaryEntry } from "../lib/storage";
import { createError } from "../middleware/errorHandler";
import { sanitizeJson } from "../lib/sanitizeJson";
import { CourseTag, GlossaryEntry } from "../types";

const router = Router();

const ExtractSchema = z.object({
  readingId: z.string(),
});

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getGlossaryEntries());
  } catch (err) { next(err); }
});

router.post("/extract", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ExtractSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const apiKey = resolveApiKey(req.headers["x-groq-api-key"] as string | undefined);
    const reading = await getReading(parsed.data.readingId);
    if (!reading) return next(createError("Reading not found", 404));

    const messages = glossaryExtractor(reading.course, reading.content, reading.title);
    const raw = await chatCompletion(messages, apiKey, { temperature: 0.3, maxTokens: 2048 });

    let result: { terms: { term: string; definition: string; example?: string | null }[] };
    try {
      result = JSON.parse(sanitizeJson(raw));
    } catch (e) {
      console.error("Glossary JSON parse failed. Raw:", raw);
      return next(createError("Failed to parse glossary from LLM. Please try again.", 500));
    }

    const now = new Date().toISOString();
    const entries: GlossaryEntry[] = result.terms.map((t) => ({
      id:              uuid(),
      term:            t.term,
      definition:      t.definition,
      example:         t.example ?? undefined,
      course:          reading.course,
      sourceReadingId: reading.id,
      dateAdded:       now,
    }));

    await saveGlossaryEntries(entries);
    res.status(201).json(entries);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteGlossaryEntry(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
