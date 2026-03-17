import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { chatCompletion, resolveApiKey } from "../lib/groqClient";
import { practiceExamGenerator, practiceExamEssayGrader } from "../lib/prompts";
import { saveExamAttempt, getExamAttempts } from "../lib/storage";
import { createError } from "../middleware/errorHandler";
import { sanitizeJson } from "../lib/sanitizeJson";
import { CourseTag, ExamAttempt, ExamQuestion, ExamQuestionFeedback } from "../types";

const router = Router();

const COURSES: CourseTag[] = [
  "Contracts","Torts","Civil Procedure","Criminal Law","Property","Constitutional Law","Other",
];

const GenerateSchema = z.object({
  course:        z.enum(COURSES as [CourseTag, ...CourseTag[]]),
  difficulty:    z.enum(["easy", "medium", "hard"]),
  questionCount: z.number().min(5).max(15).default(10),
});

const SubmitSchema = z.object({
  course:           z.enum(COURSES as [CourseTag, ...CourseTag[]]),
  difficulty:       z.enum(["easy", "medium", "hard"]),
  questions:        z.array(z.object({
    id:            z.string(),
    type:          z.enum(["mc", "essay"]),
    text:          z.string(),
    options:       z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    points:        z.number(),
  })),
  answers:          z.record(z.string(), z.string()),
  timeSpentSeconds: z.number().min(0),
});

router.post("/generate", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = GenerateSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const apiKey = resolveApiKey(req.headers["x-groq-api-key"] as string | undefined);
    const { course, difficulty, questionCount } = parsed.data;
    const messages = practiceExamGenerator(course, difficulty, questionCount);
    const raw = await chatCompletion(messages, apiKey, { temperature: 0.8, maxTokens: 3000 });

    let result;
    try {
      result = JSON.parse(sanitizeJson(raw));
    } catch (e) {
      console.error("Exam JSON parse failed. Raw:", raw);
      return next(createError("Failed to parse exam from LLM. Please try again.", 500));
    }

    res.json(result);
  } catch (err) { next(err); }
});

router.post("/submit", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = SubmitSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const apiKey = resolveApiKey(req.headers["x-groq-api-key"] as string | undefined);
    const { course, difficulty, questions, answers, timeSpentSeconds } = parsed.data;

    const feedback: ExamQuestionFeedback[] = [];
    let totalScore = 0;
    let maxScore = 0;

    for (const q of questions) {
      maxScore += q.points;
      const answer = answers[q.id] ?? "";

      if (q.type === "mc") {
        const correct = answer.trim() === (q.correctAnswer ?? "").trim();
        const score = correct ? q.points : 0;
        totalScore += score;
        feedback.push({
          questionId: q.id,
          score,
          maxScore: q.points,
          feedback: correct
            ? "Correct!"
            : `Incorrect. The correct answer is: ${q.correctAnswer ?? "N/A"}`,
          correct,
        });
      } else {
        // Essay — AI grade
        if (!answer || answer.trim().length < 10) {
          feedback.push({
            questionId: q.id,
            score: 0,
            maxScore: q.points,
            feedback: "No answer provided.",
          });
          continue;
        }

        const gradeMessages = practiceExamEssayGrader(course, q as ExamQuestion, answer);
        const gradeRaw = await chatCompletion(gradeMessages, apiKey, { temperature: 0.2, maxTokens: 512 });

        let graded: { score: number; feedback: string; missedIssues: string };
        try {
          graded = JSON.parse(sanitizeJson(gradeRaw));
        } catch (e) {
          graded = { score: Math.round(q.points * 0.5), feedback: "Unable to parse grade. Estimated partial credit.", missedIssues: "" };
        }

        const earnedScore = Math.min(Math.max(0, graded.score), q.points);
        totalScore += earnedScore;
        feedback.push({
          questionId: q.id,
          score: earnedScore,
          maxScore: q.points,
          feedback: `${graded.feedback}${graded.missedIssues ? ` Missed: ${graded.missedIssues}` : ""}`,
        });
      }
    }

    const attempt: ExamAttempt = {
      id:               uuid(),
      course,
      difficulty,
      questions:        questions as ExamQuestion[],
      answers,
      feedback,
      totalScore,
      maxScore,
      dateAttempted:    new Date().toISOString(),
      timeSpentSeconds,
    };

    await saveExamAttempt(attempt);
    res.status(201).json({ attemptId: attempt.id, totalScore, maxScore, feedback });
  } catch (err) { next(err); }
});

router.get("/history", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getExamAttempts());
  } catch (err) { next(err); }
});

export default router;
