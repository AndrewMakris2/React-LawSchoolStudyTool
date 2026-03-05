import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { chatCompletion } from "../lib/groqClient";
import { issueSpotter, issueSpotterPromptGenerator } from "../lib/prompts";
import { saveDrillAttempt, getDrillAttempts } from "../lib/storage";
import { createError } from "../middleware/errorHandler";
import { sanitizeJson } from "../lib/sanitizeJson";
import { CourseTag, DrillAttempt } from "../types";

const router = Router();

const COURSES: CourseTag[] = [
  "Contracts","Torts","Civil Procedure","Criminal Law","Property","Constitutional Law","Other",
];

const GenerateSchema = z.object({
  course:     z.enum(COURSES as [CourseTag, ...CourseTag[]]),
  difficulty: z.enum(["easy", "medium", "hard"]),
});

const GradeSchema = z.object({
  course:           z.enum(COURSES as [CourseTag, ...CourseTag[]]),
  difficulty:       z.enum(["easy", "medium", "hard"]),
  prompt:           z.string().min(20),
  userAnswer:       z.string().min(10),
  timeSpentSeconds: z.number().min(0),
});

router.post("/generate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = GenerateSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const { course, difficulty } = parsed.data;
    const messages = issueSpotterPromptGenerator(course, difficulty);
    const raw = await chatCompletion(messages, { temperature: 0.9, maxTokens: 1024 });

    let result;
    try {
      result = JSON.parse(sanitizeJson(raw));
    } catch (e) {
      console.error("JSON parse failed. Raw LLM output:", raw);
      return next(createError("Failed to parse hypothetical from LLM. Please try again.", 500));
    }

    res.json(result);
  } catch (err) { next(err); }
});

router.post("/grade", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = GradeSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const { course, difficulty, prompt, userAnswer, timeSpentSeconds } = parsed.data;
    const messages = issueSpotter(course, difficulty, prompt, userAnswer);
    const raw = await chatCompletion(messages, { temperature: 0.3, maxTokens: 1500 });

    let graded;
    try {
      graded = JSON.parse(sanitizeJson(raw));
    } catch (e) {
      console.error("JSON parse failed. Raw LLM output:", raw);
      return next(createError("Failed to parse grading result from LLM. Please try again.", 500));
    }

    const attempt: DrillAttempt = {
      id:               uuid(),
      course,
      difficulty,
      prompt,
      userAnswer,
      score:            graded.score,
      modelOutline:     graded.modelOutline ?? "",
      suggestions:      graded.suggestions  ?? [],
      dateAttempted:    new Date().toISOString(),
      timeSpentSeconds,
    };

    await saveDrillAttempt(attempt);
    res.json({ ...graded, attemptId: attempt.id });
  } catch (err) { next(err); }
});

router.get("/history", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getDrillAttempts());
  } catch (err) { next(err); }
});

export default router;
