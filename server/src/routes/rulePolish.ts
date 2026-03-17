import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { chatCompletion, resolveApiKey } from "../lib/groqClient";
import { rulePolisher } from "../lib/prompts";
import { createError } from "../middleware/errorHandler";
import { CourseTag, PolishStyle } from "../types";

const router = Router();

const COURSES: CourseTag[] = [
  "Contracts","Torts","Civil Procedure","Criminal Law","Property","Constitutional Law","Other",
];

const RulePolishSchema = z.object({
  userRule: z.string().min(5),
  style: z.enum(["concise", "standard", "verbose"] as [PolishStyle, ...PolishStyle[]]),
  course: z.enum(COURSES as [CourseTag, ...CourseTag[]]).optional(),
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RulePolishSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const apiKey = resolveApiKey(req.headers["x-groq-api-key"] as string | undefined);
    const { userRule, style, course } = parsed.data;
    const messages = rulePolisher(userRule, style, course);
    const result = await chatCompletion(messages, apiKey, { temperature: 0.4, maxTokens: 512 });

    res.json({ polished: result.trim() });
  } catch (err) { next(err); }
});

export default router;
