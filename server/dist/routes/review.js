"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const storage_1 = require("../lib/storage");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const ReviewSchema = zod_1.z.object({
    cardId: zod_1.z.string(),
    grade: zod_1.z.enum(["again", "hard", "good", "easy"]),
});
// SM-2 inspired algorithm
function scheduleCard(card, grade) {
    const gradeMap = { again: 0, hard: 1, good: 3, easy: 5 };
    const q = gradeMap[grade];
    let { easeFactor, interval, repetitions } = card;
    if (q < 3) {
        repetitions = 0;
        interval = 1;
    }
    else {
        if (repetitions === 0)
            interval = 1;
        else if (repetitions === 1)
            interval = 6;
        else
            interval = Math.round(interval * easeFactor);
        repetitions += 1;
    }
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);
    return { ...card, easeFactor, interval, repetitions, lastGrade: grade, nextReview: nextReview.toISOString() };
}
router.post("/", async (req, res, next) => {
    try {
        const parsed = ReviewSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const { cardId, grade } = parsed.data;
        const card = await (0, storage_1.getFlashcard)(cardId);
        if (!card)
            return next((0, errorHandler_1.createError)("Card not found", 404));
        const updated = scheduleCard(card, grade);
        await (0, storage_1.saveFlashcard)(updated);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
