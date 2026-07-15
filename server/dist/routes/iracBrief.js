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
const COURSES = [
    "Contracts", "Torts", "Civil Procedure", "Criminal Law", "Property", "Constitutional Law", "Other",
];
const GenerateIracSchema = zod_1.z
    .object({
    readingId: zod_1.z.string().optional(),
    caseText: zod_1.z.string().min(20).optional(),
    title: zod_1.z.string().min(1).max(200).optional(),
    course: zod_1.z.enum(COURSES).optional(),
})
    .refine((data) => !!data.readingId || (!!data.caseText && !!data.title), {
    message: "Provide either readingId, or both caseText and title",
});
const UpdateIracSchema = zod_1.z.object({
    issue: zod_1.z.string().optional(),
    rule: zod_1.z.string().optional(),
    application: zod_1.z.string().optional(),
    conclusion: zod_1.z.string().optional(),
});
router.get("/", async (req, res, next) => {
    try {
        res.json(await (0, storage_1.getIracBriefs)(req.userId));
    }
    catch (err) {
        next(err);
    }
});
router.get("/:id", async (req, res, next) => {
    try {
        const brief = await (0, storage_1.getIracBrief)(req.params.id, req.userId);
        if (!brief)
            return next((0, errorHandler_1.createError)("IRAC brief not found", 404));
        res.json(brief);
    }
    catch (err) {
        next(err);
    }
});
router.post("/", async (req, res, next) => {
    try {
        const parsed = GenerateIracSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        let caseText;
        let title;
        let course;
        let readingId;
        if (parsed.data.readingId) {
            const reading = await (0, storage_1.getReading)(parsed.data.readingId, req.userId);
            if (!reading)
                return next((0, errorHandler_1.createError)("Reading not found", 404));
            caseText = reading.content;
            title = reading.title;
            course = reading.course;
            readingId = reading.id;
        }
        else {
            caseText = parsed.data.caseText;
            title = parsed.data.title;
            course = parsed.data.course;
        }
        const messages = (0, prompts_1.iracBriefBuilder)(caseText, title);
        const raw = await (0, groqClient_1.chatCompletion)(messages, req.apiKey, { temperature: 0.3, maxTokens: 1536 });
        let parsedBrief;
        try {
            parsedBrief = JSON.parse((0, sanitizeJson_1.sanitizeJson)(raw));
        }
        catch (e) {
            console.error("IRAC brief JSON parse failed. Raw:", raw);
            return next((0, errorHandler_1.createError)("Failed to parse IRAC brief from LLM. Please try again.", 500));
        }
        const now = new Date().toISOString();
        const brief = {
            id: (0, uuid_1.v4)(),
            userId: req.userId,
            readingId,
            caseText: readingId ? undefined : caseText,
            title,
            course,
            issue: parsedBrief.issue ?? "",
            rule: parsedBrief.rule ?? "",
            application: parsedBrief.application ?? "",
            conclusion: parsedBrief.conclusion ?? "",
            dateCreated: now,
            dateModified: now,
        };
        await (0, storage_1.saveIracBrief)(brief);
        res.status(201).json(brief);
    }
    catch (err) {
        next(err);
    }
});
router.put("/:id", async (req, res, next) => {
    try {
        const existing = await (0, storage_1.getIracBrief)(req.params.id, req.userId);
        if (!existing)
            return next((0, errorHandler_1.createError)("IRAC brief not found", 404));
        const parsed = UpdateIracSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const updated = {
            ...existing,
            ...parsed.data,
            dateModified: new Date().toISOString(),
        };
        await (0, storage_1.saveIracBrief)(updated);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
