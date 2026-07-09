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
    questionCount: zod_1.z.number().min(5).max(15).default(10),
});
const SubmitSchema = zod_1.z.object({
    course: zod_1.z.enum(COURSES),
    difficulty: zod_1.z.enum(["easy", "medium", "hard"]),
    questions: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.enum(["mc", "essay"]),
        text: zod_1.z.string(),
        options: zod_1.z.array(zod_1.z.string()).optional(),
        correctAnswer: zod_1.z.string().optional(),
        points: zod_1.z.number(),
    })),
    answers: zod_1.z.record(zod_1.z.string(), zod_1.z.string()),
    timeSpentSeconds: zod_1.z.number().min(0),
});
router.post("/generate", async (req, res, next) => {
    try {
        const parsed = GenerateSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const { course, difficulty, questionCount } = parsed.data;
        const messages = (0, prompts_1.practiceExamGenerator)(course, difficulty, questionCount);
        const raw = await (0, groqClient_1.chatCompletion)(messages, req.apiKey, { temperature: 0.8, maxTokens: 3000 });
        let result;
        try {
            result = JSON.parse((0, sanitizeJson_1.sanitizeJson)(raw));
        }
        catch (e) {
            console.error("Exam JSON parse failed. Raw:", raw);
            return next((0, errorHandler_1.createError)("Failed to parse exam from LLM. Please try again.", 500));
        }
        res.json(result);
    }
    catch (err) {
        next(err);
    }
});
router.post("/submit", async (req, res, next) => {
    try {
        const parsed = SubmitSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const { course, difficulty, questions, answers, timeSpentSeconds } = parsed.data;
        const feedback = [];
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
            }
            else {
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
                const gradeMessages = (0, prompts_1.practiceExamEssayGrader)(course, q, answer);
                const gradeRaw = await (0, groqClient_1.chatCompletion)(gradeMessages, req.apiKey, { temperature: 0.2, maxTokens: 512 });
                let graded;
                try {
                    graded = JSON.parse((0, sanitizeJson_1.sanitizeJson)(gradeRaw));
                }
                catch (e) {
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
        const attempt = {
            id: (0, uuid_1.v4)(),
            userId: req.userId,
            course,
            difficulty,
            questions: questions,
            answers,
            feedback,
            totalScore,
            maxScore,
            dateAttempted: new Date().toISOString(),
            timeSpentSeconds,
        };
        await (0, storage_1.saveExamAttempt)(attempt);
        res.status(201).json({ attemptId: attempt.id, totalScore, maxScore, feedback });
    }
    catch (err) {
        next(err);
    }
});
router.get("/history", async (req, res, next) => {
    try {
        res.json(await (0, storage_1.getExamAttempts)(req.userId));
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
