import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { chatCompletion, resolveApiKey } from "../lib/groqClient";
import { outlineBuilder } from "../lib/prompts";
import { getReadings, saveOutline, getOutlines, deleteOutline } from "../lib/storage";
import { createError } from "../middleware/errorHandler";
import { sanitizeJson } from "../lib/sanitizeJson";
import { CourseTag, CourseOutline } from "../types";

const router = Router();

const COURSES: CourseTag[] = [
  "Contracts","Torts","Civil Procedure","Criminal Law","Property","Constitutional Law","Other",
];

const GenerateSchema = z.object({
  course:         z.enum(COURSES as [CourseTag, ...CourseTag[]]),
  readingIds:     z.array(z.string()).min(1).max(5),
  title:          z.string().min(1).max(100).optional(),
});

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getOutlines());
  } catch (err) { next(err); }
});

router.post("/generate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = GenerateSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const apiKey = resolveApiKey(req.headers["x-groq-api-key"] as string | undefined);
    const { course, readingIds, title } = parsed.data;

    const allReadings = await getReadings();
    const selected = readingIds.map((id) => allReadings.find((r) => r.id === id)).filter(Boolean);
    if (selected.length === 0) return next(createError("No valid readings found", 404));

    const combined = selected
      .map((r) => `=== ${r!.title} ===\n${r!.content}`)
      .join("\n\n");

    const messages = outlineBuilder(course, combined);
    const raw = await chatCompletion(messages, apiKey, { temperature: 0.3, maxTokens: 3000 });

    let result;
    try {
      result = JSON.parse(sanitizeJson(raw));
    } catch (e) {
      console.error("Outline JSON parse failed. Raw:", raw);
      return next(createError("Failed to parse outline from LLM. Please try again.", 500));
    }

    const outline: CourseOutline = {
      id:               uuid(),
      course,
      title:            title ?? `${course} Outline`,
      topics:           result.topics ?? [],
      sourceReadingIds: readingIds,
      dateCreated:      new Date().toISOString(),
    };

    await saveOutline(outline);
    res.status(201).json(outline);
  } catch (err) { next(err); }
});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteOutline(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
