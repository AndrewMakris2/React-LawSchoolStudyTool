import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { chatCompletion } from "../lib/groqClient";
import { flashcardGenerator } from "../lib/prompts";
import { getDecks, getDeck, saveDeck, deleteDeck, getFlashcardsByDeck, saveFlashcards, getReading, getBrief } from "../lib/storage";
import { createError } from "../middleware/errorHandler";
import { sanitizeJson } from "../lib/sanitizeJson";
import { CourseTag, Flashcard, FlashcardDeck } from "../types";

const router = Router();

const COURSES: CourseTag[] = [
  "Contracts","Torts","Civil Procedure","Criminal Law","Property","Constitutional Law","Other",
];

const GenerateSchema = z.object({
  name:            z.string().min(1),
  course:          z.enum(COURSES as [CourseTag, ...CourseTag[]]),
  sourceReadingId: z.string().optional(),
  sourceBriefId:   z.string().optional(),
  cardCount:       z.number().min(3).max(20).default(8),
});

function initialCard(
  userId: string,
  deckId: string,
  front: string,
  back: string,
  hypo?: string | null
): Flashcard {
  return {
    id:          uuid(),
    userId,
    deckId,
    front,
    back,
    hypo:        hypo ?? undefined,
    nextReview:  new Date().toISOString(),
    interval:    1,
    easeFactor:  2.5,
    repetitions: 0,
    lastGrade:   undefined,
  };
}

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await getDecks(req.userId));
  } catch (err) { next(err); }
});

router.get("/:deckId/cards", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deck = await getDeck(req.params.deckId, req.userId);
    if (!deck) return next(createError("Deck not found", 404));
    res.json(await getFlashcardsByDeck(req.params.deckId, req.userId));
  } catch (err) { next(err); }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = GenerateSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const { name, course, sourceReadingId, sourceBriefId, cardCount } = parsed.data;

    let sourceText = "";
    if (sourceReadingId) {
      const reading = await getReading(sourceReadingId, req.userId);
      if (!reading) return next(createError("Reading not found", 404));
      sourceText = reading.content;
    } else if (sourceBriefId) {
      const brief = await getBrief(sourceBriefId, req.userId);
      if (!brief) return next(createError("Brief not found", 404));
      sourceText = [
        `FACTS: ${brief.facts}`,
        `RULE: ${brief.rule}`,
        `HOLDING: ${brief.holding}`,
        `REASONING: ${brief.reasoning}`,
        `NOTES: ${brief.notes}`,
      ].join("\n\n");
    } else {
      return next(createError("Must provide sourceReadingId or sourceBriefId", 400));
    }

    const messages = flashcardGenerator(sourceText, course, cardCount);
    const raw = await chatCompletion(messages, req.apiKey, { temperature: 0.7, maxTokens: 2048 });

    let result;
    try {
      result = JSON.parse(sanitizeJson(raw));
    } catch (e) {
      console.error("Flashcard JSON parse failed. Raw:", raw);
      return next(createError("Failed to parse flashcards from LLM. Please try again.", 500));
    }

    const now = new Date().toISOString();
    const deck: FlashcardDeck = {
      id:              uuid(),
      userId:          req.userId,
      name,
      course,
      sourceReadingId,
      sourceBriefId,
      dateCreated:     now,
      cardCount:       result.cards.length,
    };

    const cards: Flashcard[] = (
      result.cards as { front: string; back: string; hypo?: string }[]
    ).map((c) => initialCard(req.userId, deck.id, c.front, c.back, c.hypo));

    await saveDeck(deck);
    await saveFlashcards(cards);
    res.status(201).json({ deck, cards });
  } catch (err) { next(err); }
});

router.delete("/:deckId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deck = await getDeck(req.params.deckId, req.userId);
    if (!deck) return next(createError("Deck not found", 404));
    await deleteDeck(req.params.deckId, req.userId);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
