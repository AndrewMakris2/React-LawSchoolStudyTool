import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getFlashcard, saveFlashcard, getDeck, saveDeck } from "../lib/storage";
import { createError } from "../middleware/errorHandler";
import { Grade, Flashcard } from "../../../shared/types";

const router = Router();

const ReviewSchema = z.object({
  cardId: z.string(),
  grade: z.enum(["again", "hard", "good", "easy"] as [Grade, ...Grade[]]),
});

// SM-2 inspired algorithm
function scheduleCard(card: Flashcard, grade: Grade): Flashcard {
  const gradeMap = { again: 0, hard: 1, good: 3, easy: 5 };
  const q = gradeMap[grade];

  let { easeFactor, interval, repetitions } = card;

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { ...card, easeFactor, interval, repetitions, lastGrade: grade, nextReview: nextReview.toISOString() };
}

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = ReviewSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const { cardId, grade } = parsed.data;
    const card = await getFlashcard(cardId);
    if (!card) return next(createError("Card not found", 404));

    const updated = scheduleCard(card, grade);
    await saveFlashcard(updated);

    res.json(updated);
  } catch (err) { next(err); }
});

export default router;