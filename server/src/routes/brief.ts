import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { getReading, saveBrief, getBriefs, getBrief, saveReading } from "../lib/storage";
import { chatCompletion } from "../lib/groqClient";
import { briefBuilder } from "../lib/prompts";
import { createError } from "../middleware/errorHandler";
import { sanitizeJson } from "../lib/sanitizeJson";
import { CaseBrief } from "../../../shared/types";

const router = Router();

const GenerateBriefSchema = z.object({ readingId: z.string() });

const UpdateBriefSchema = z.object({
  facts:             z.string().optional(),
  proceduralHistory: z.string().optional(),
  issues:            z.string().optional(),
  holding:           z.string().optional(),
  rule:              z.string().optional(),
  reasoning:         z.string().optional(),
  disposition:       z.string().optional(),
  notes:             z.string().optional(),
});

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getBriefs());
  } catch (err) { next(err); }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brief = await getBrief(req.params.id);
    if (!brief) return next(createError("Brief not found", 404));
    res.json(brief);
  } catch (err) { next(err); }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = GenerateBriefSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const reading = await getReading(parsed.data.readingId);
    if (!reading) return next(createError("Reading not found", 404));

    const messages = briefBuilder(reading.content, reading.title);
    const raw = await chatCompletion(messages, { temperature: 0.3, maxTokens: 2048 });

    let parsedBrief: Partial<CaseBrief>;
    try {
      parsedBrief = JSON.parse(sanitizeJson(raw));
    } catch (e) {
      console.error("Brief JSON parse failed. Raw:", raw);
      return next(createError("Failed to parse brief from LLM. Please try again.", 500));
    }

    const now = new Date().toISOString();
    const brief: CaseBrief = {
      id:                uuid(),
      readingId:         reading.id,
      title:             reading.title,
      course:            reading.course,
      facts:             parsedBrief.facts             ?? "",
      proceduralHistory: parsedBrief.proceduralHistory ?? "",
      issues:            parsedBrief.issues            ?? "",
      holding:           parsedBrief.holding           ?? "",
      rule:              parsedBrief.rule              ?? "",
      reasoning:         parsedBrief.reasoning         ?? "",
      disposition:       parsedBrief.disposition       ?? "",
      notes:             parsedBrief.notes             ?? "",
      dateCreated:       now,
      dateModified:      now,
    };

    await saveBrief(brief);
    await saveReading({ ...reading, briefId: brief.id });
    res.status(201).json(brief);
  } catch (err) { next(err); }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await getBrief(req.params.id);
    if (!existing) return next(createError("Brief not found", 404));
    const parsed = UpdateBriefSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));
    const updated: CaseBrief = {
      ...existing,
      ...parsed.data,
      dateModified: new Date().toISOString(),
    };
    await saveBrief(updated);
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
