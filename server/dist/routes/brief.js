"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const storage_1 = require("../lib/storage");
const groqClient_1 = require("../lib/groqClient");
const prompts_1 = require("../lib/prompts");
const errorHandler_1 = require("../middleware/errorHandler");
const sanitizeJson_1 = require("../lib/sanitizeJson");
const router = (0, express_1.Router)();
const GenerateBriefSchema = zod_1.z.object({ readingId: zod_1.z.string() });
const UpdateBriefSchema = zod_1.z.object({
    facts: zod_1.z.string().optional(),
    proceduralHistory: zod_1.z.string().optional(),
    issues: zod_1.z.string().optional(),
    holding: zod_1.z.string().optional(),
    rule: zod_1.z.string().optional(),
    reasoning: zod_1.z.string().optional(),
    disposition: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
router.get("/", async (_req, res, next) => {
    try {
        res.json(await (0, storage_1.getBriefs)());
    }
    catch (err) {
        next(err);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const brief = await (0, storage_1.getBrief)(req.params.id);
        if (!brief)
            return next((0, errorHandler_1.createError)("Brief not found", 404));
        res.json(brief);
    }
    catch (err) {
        next(err);
    }
});
router.post("/", async (req, res, next) => {
    try {
        const parsed = GenerateBriefSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const reading = await (0, storage_1.getReading)(parsed.data.readingId);
        if (!reading)
            return next((0, errorHandler_1.createError)("Reading not found", 404));
        const messages = (0, prompts_1.briefBuilder)(reading.content, reading.title);
        const raw = await (0, groqClient_1.chatCompletion)(messages, { temperature: 0.3, maxTokens: 2048 });
        let parsedBrief;
        try {
            parsedBrief = JSON.parse((0, sanitizeJson_1.sanitizeJson)(raw));
        }
        catch (e) {
            console.error("Brief JSON parse failed. Raw:", raw);
            return next((0, errorHandler_1.createError)("Failed to parse brief from LLM. Please try again.", 500));
        }
        const now = new Date().toISOString();
        const brief = {
            id: (0, uuid_1.v4)(),
            readingId: reading.id,
            title: reading.title,
            course: reading.course,
            facts: parsedBrief.facts ?? "",
            proceduralHistory: parsedBrief.proceduralHistory ?? "",
            issues: parsedBrief.issues ?? "",
            holding: parsedBrief.holding ?? "",
            rule: parsedBrief.rule ?? "",
            reasoning: parsedBrief.reasoning ?? "",
            disposition: parsedBrief.disposition ?? "",
            notes: parsedBrief.notes ?? "",
            dateCreated: now,
            dateModified: now,
        };
        await (0, storage_1.saveBrief)(brief);
        await (0, storage_1.saveReading)({ ...reading, briefId: brief.id });
        res.status(201).json(brief);
    }
    catch (err) {
        next(err);
    }
});
router.put("/:id", async (req, res, next) => {
    try {
        const existing = await (0, storage_1.getBrief)(req.params.id);
        if (!existing)
            return next((0, errorHandler_1.createError)("Brief not found", 404));
        const parsed = UpdateBriefSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const updated = {
            ...existing,
            ...parsed.data,
            dateModified: new Date().toISOString(),
        };
        await (0, storage_1.saveBrief)(updated);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
