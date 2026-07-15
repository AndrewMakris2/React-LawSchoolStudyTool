import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { getReading, saveIracBrief, getIracBriefs, getIracBrief } from "../lib/storage";
import { chatCompletion } from "../lib/groqClient";
import { iracBriefBuilder } from "../lib/prompts";
import { createError } from "../middleware/errorHandler";
import { sanitizeJson } from "../lib/sanitizeJson";
import { CourseTag, IracBrief } from "../types";

const router = Router();

const COURSES: CourseTag[] = [
  "Contracts","Torts","Civil Procedure","Criminal Law","Property","Constitutional Law","Other",
];

const GenerateIracSchema = z
  .object({
    readingId: z.string().optional(),
    caseText:  z.string().min(20).optional(),
    title:     z.string().min(1).max(200).optional(),
    course:    z.enum(COURSES as [CourseTag, ...CourseTag[]]).optional(),
  })
  .refine((data) => !!data.readingId || (!!data.caseText && !!data.title), {
    message: "Provide either readingId, or both caseText and title",
  });

const UpdateIracSchema = z.object({
  issue:       z.string().optional(),
  rule:        z.string().optional(),
  application: z.string().optional(),
  conclusion:  z.string().optional(),
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getIracBriefs(req.userId));
  } catch (err) { next(err); }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const brief = await getIracBrief(req.params.id, req.userId);
    if (!brief) return next(createError("IRAC brief not found", 404));
    res.json(brief);
  } catch (err) { next(err); }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = GenerateIracSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    let caseText: string;
    let title: string;
    let course: CourseTag | undefined;
    let readingId: string | undefined;

    if (parsed.data.readingId) {
      const reading = await getReading(parsed.data.readingId, req.userId);
      if (!reading) return next(createError("Reading not found", 404));
      caseText  = reading.content;
      title     = reading.title;
      course    = reading.course;
      readingId = reading.id;
    } else {
      caseText = parsed.data.caseText!;
      title    = parsed.data.title!;
      course   = parsed.data.course;
    }

    const messages = iracBriefBuilder(caseText, title);
    const raw = await chatCompletion(messages, req.apiKey, { temperature: 0.3, maxTokens: 1536 });

    let parsedBrief: Partial<Pick<IracBrief, "issue" | "rule" | "application" | "conclusion">>;
    try {
      parsedBrief = JSON.parse(sanitizeJson(raw));
    } catch (e) {
      console.error("IRAC brief JSON parse failed. Raw:", raw);
      return next(createError("Failed to parse IRAC brief from LLM. Please try again.", 500));
    }

    const now = new Date().toISOString();
    const brief: IracBrief = {
      id:          uuid(),
      userId:      req.userId,
      readingId,
      caseText:    readingId ? undefined : caseText,
      title,
      course,
      issue:       parsedBrief.issue       ?? "",
      rule:        parsedBrief.rule        ?? "",
      application: parsedBrief.application ?? "",
      conclusion:  parsedBrief.conclusion  ?? "",
      dateCreated: now,
      dateModified: now,
    };

    await saveIracBrief(brief);
    res.status(201).json(brief);
  } catch (err) { next(err); }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await getIracBrief(req.params.id, req.userId);
    if (!existing) return next(createError("IRAC brief not found", 404));
    const parsed = UpdateIracSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));
    const updated: IracBrief = {
      ...existing,
      ...parsed.data,
      dateModified: new Date().toISOString(),
    };
    await saveIracBrief(updated);
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
