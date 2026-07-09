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
const ExtractSchema = zod_1.z.object({
    readingId: zod_1.z.string(),
});
router.get("/", async (req, res, next) => {
    try {
        res.json(await (0, storage_1.getGlossaryEntries)(req.userId));
    }
    catch (err) {
        next(err);
    }
});
router.post("/extract", async (req, res, next) => {
    try {
        const parsed = ExtractSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const reading = await (0, storage_1.getReading)(parsed.data.readingId, req.userId);
        if (!reading)
            return next((0, errorHandler_1.createError)("Reading not found", 404));
        const messages = (0, prompts_1.glossaryExtractor)(reading.course, reading.content, reading.title);
        const raw = await (0, groqClient_1.chatCompletion)(messages, req.apiKey, { temperature: 0.3, maxTokens: 2048 });
        let result;
        try {
            result = JSON.parse((0, sanitizeJson_1.sanitizeJson)(raw));
        }
        catch (e) {
            console.error("Glossary JSON parse failed. Raw:", raw);
            return next((0, errorHandler_1.createError)("Failed to parse glossary from LLM. Please try again.", 500));
        }
        const now = new Date().toISOString();
        const entries = result.terms.map((t) => ({
            id: (0, uuid_1.v4)(),
            userId: req.userId,
            term: t.term,
            definition: t.definition,
            example: t.example ?? undefined,
            course: reading.course,
            sourceReadingId: reading.id,
            dateAdded: now,
        }));
        await (0, storage_1.saveGlossaryEntries)(entries);
        res.status(201).json(entries);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:id", async (req, res, next) => {
    try {
        await (0, storage_1.deleteGlossaryEntry)(req.params.id, req.userId);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
