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
    readingIds: zod_1.z.array(zod_1.z.string()).min(1).max(5),
    title: zod_1.z.string().min(1).max(100).optional(),
});
router.get("/", async (_req, res, next) => {
    try {
        res.json(await (0, storage_1.getOutlines)());
    }
    catch (err) {
        next(err);
    }
});
router.post("/generate", async (req, res, next) => {
    try {
        const parsed = GenerateSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const apiKey = (0, groqClient_1.resolveApiKey)(req.headers["x-groq-api-key"]);
        const { course, readingIds, title } = parsed.data;
        const allReadings = await (0, storage_1.getReadings)();
        const selected = readingIds.map((id) => allReadings.find((r) => r.id === id)).filter(Boolean);
        if (selected.length === 0)
            return next((0, errorHandler_1.createError)("No valid readings found", 404));
        const combined = selected
            .map((r) => `=== ${r.title} ===\n${r.content}`)
            .join("\n\n");
        const messages = (0, prompts_1.outlineBuilder)(course, combined);
        const raw = await (0, groqClient_1.chatCompletion)(messages, apiKey, { temperature: 0.3, maxTokens: 3000 });
        let result;
        try {
            result = JSON.parse((0, sanitizeJson_1.sanitizeJson)(raw));
        }
        catch (e) {
            console.error("Outline JSON parse failed. Raw:", raw);
            return next((0, errorHandler_1.createError)("Failed to parse outline from LLM. Please try again.", 500));
        }
        const outline = {
            id: (0, uuid_1.v4)(),
            course,
            title: title ?? `${course} Outline`,
            topics: result.topics ?? [],
            sourceReadingIds: readingIds,
            dateCreated: new Date().toISOString(),
        };
        await (0, storage_1.saveOutline)(outline);
        res.status(201).json(outline);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:id", async (req, res, next) => {
    try {
        await (0, storage_1.deleteOutline)(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
