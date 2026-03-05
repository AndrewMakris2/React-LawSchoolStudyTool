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
    course: zod_1.z.enum(COURSES),
    difficulty: zod_1.z.enum(["easy", "medium", "hard"]),
});
const GradeSchema = zod_1.z.object({
    course: zod_1.z.enum(COURSES),
    difficulty: zod_1.z.enum(["easy", "medium", "hard"]),
    prompt: zod_1.z.string().min(20),
    userAnswer: zod_1.z.string().min(10),
    timeSpentSeconds: zod_1.z.number().min(0),
});
router.post("/generate", async (req, res, next) => {
    try {
        const parsed = GenerateSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const { course, difficulty } = parsed.data;
        const messages = (0, prompts_1.issueSpotterPromptGenerator)(course, difficulty);
        const raw = await (0, groqClient_1.chatCompletion)(messages, { temperature: 0.9, maxTokens: 1024 });
        let result;
        try {
            result = JSON.parse((0, sanitizeJson_1.sanitizeJson)(raw));
        }
        catch (e) {
            console.error("JSON parse failed. Raw LLM output:", raw);
            return next((0, errorHandler_1.createError)("Failed to parse hypothetical from LLM. Please try again.", 500));
        }
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.post("/grade", async (req, res, next) => {
    try {
        const parsed = GradeSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const { course, difficulty, prompt, userAnswer, timeSpentSeconds } = parsed.data;
        const messages = (0, prompts_1.issueSpotter)(course, difficulty, prompt, userAnswer);
        const raw = await (0, groqClient_1.chatCompletion)(messages, { temperature: 0.3, maxTokens: 1500 });
        let graded;
        try {
            graded = JSON.parse((0, sanitizeJson_1.sanitizeJson)(raw));
        }
        catch (e) {
            console.error("JSON parse failed. Raw LLM output:", raw);
            return next((0, errorHandler_1.createError)("Failed to parse grading result from LLM. Please try again.", 500));
        }
        const attempt = {
            id: (0, uuid_1.v4)(),
            course,
            difficulty,
            prompt,
            userAnswer,
            score: graded.score,
            modelOutline: graded.modelOutline ?? "",
            suggestions: graded.suggestions ?? [],
            dateAttempted: new Date().toISOString(),
            timeSpentSeconds,
        };
        await (0, storage_1.saveDrillAttempt)(attempt);
        res.json({ ...graded, attemptId: attempt.id });
    }
    catch (err) {
        next(err);
    }
});
router.get("/history", async (_req, res, next) => {
    try {
        res.json(await (0, storage_1.getDrillAttempts)());
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
