"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const groqClient_1 = require("../lib/groqClient");
const prompts_1 = require("../lib/prompts");
const storage_1 = require("../lib/storage");
const errorHandler_1 = require("../middleware/errorHandler");
const sanitizeJson_1 = require("../lib/sanitizeJson");
const router = (0, express_1.Router)();
const COURSES = [
    "Contracts", "Torts", "Civil Procedure", "Criminal Law", "Property", "Constitutional Law", "Other",
];
const GenerateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    course: zod_1.z.enum(COURSES),
    sourceReadingId: zod_1.z.string().optional(),
    sourceBriefId: zod_1.z.string().optional(),
    cardCount: zod_1.z.number().min(3).max(20).default(8),
});
function initialCard(deckId, front, back, hypo) {
    return {
        id: (0, uuid_1.v4)(),
        deckId,
        front,
        back,
        hypo: hypo ?? undefined,
        nextReview: new Date().toISOString(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
        lastGrade: undefined,
    };
}
router.get("/", async (_req, res, next) => {
    try {
        res.json(await (0, storage_1.getDecks)());
    }
    catch (err) {
        next(err);
    }
});
router.get("/:deckId/cards", async (req, res, next) => {
    try {
        const deck = await (0, storage_1.getDeck)(req.params.deckId);
        if (!deck)
            return next((0, errorHandler_1.createError)("Deck not found", 404));
        res.json(await (0, storage_1.getFlashcardsByDeck)(req.params.deckId));
    }
    catch (err) {
        next(err);
    }
});
router.post("/", async (req, res, next) => {
    try {
        const parsed = GenerateSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const { name, course, sourceReadingId, sourceBriefId, cardCount } = parsed.data;
        let sourceText = "";
        if (sourceReadingId) {
            const reading = await (0, storage_1.getReading)(sourceReadingId);
            if (!reading)
                return next((0, errorHandler_1.createError)("Reading not found", 404));
            sourceText = reading.content;
        }
        else if (sourceBriefId) {
            const brief = await (0, storage_1.getBrief)(sourceBriefId);
            if (!brief)
                return next((0, errorHandler_1.createError)("Brief not found", 404));
            sourceText = [
                `FACTS: ${brief.facts}`,
                `RULE: ${brief.rule}`,
                `HOLDING: ${brief.holding}`,
                `REASONING: ${brief.reasoning}`,
                `NOTES: ${brief.notes}`,
            ].join("\n\n");
        }
        else {
            return next((0, errorHandler_1.createError)("Must provide sourceReadingId or sourceBriefId", 400));
        }
        const messages = (0, prompts_1.flashcardGenerator)(sourceText, course, cardCount);
        const raw = await (0, groqClient_1.chatCompletion)(messages, { temperature: 0.7, maxTokens: 2048 });
        let result;
        try {
            result = JSON.parse((0, sanitizeJson_1.sanitizeJson)(raw));
        }
        catch (e) {
            console.error("Flashcard JSON parse failed. Raw:", raw);
            return next((0, errorHandler_1.createError)("Failed to parse flashcards from LLM. Please try again.", 500));
        }
        const now = new Date().toISOString();
        const deck = {
            id: (0, uuid_1.v4)(),
            name,
            course,
            sourceReadingId,
            sourceBriefId,
            dateCreated: now,
            cardCount: result.cards.length,
        };
        const cards = result.cards.map((c) => initialCard(deck.id, c.front, c.back, c.hypo));
        await (0, storage_1.saveDeck)(deck);
        await (0, storage_1.saveFlashcards)(cards);
        res.status(201).json({ deck, cards });
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:deckId", async (req, res, next) => {
    try {
        const deck = await (0, storage_1.getDeck)(req.params.deckId);
        if (!deck)
            return next((0, errorHandler_1.createError)("Deck not found", 404));
        await (0, storage_1.deleteDeck)(req.params.deckId);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
