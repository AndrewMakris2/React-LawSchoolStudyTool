"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const storage_1 = require("../lib/storage");
const groqClient_1 = require("../lib/groqClient");
const prompts_1 = require("../lib/prompts");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const ChatSchema = zod_1.z.object({
    readingId: zod_1.z.string(),
    messages: zod_1.z.array(zod_1.z.object({
        role: zod_1.z.enum(["user", "assistant", "system"]),
        content: zod_1.z.string(),
    })),
    coldCallMode: zod_1.z.boolean().default(false),
    strictMode: zod_1.z.boolean().default(false),
    hintRequested: zod_1.z.boolean().default(false),
});
router.post("/", async (req, res, next) => {
    try {
        const parsed = ChatSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const { readingId, messages, coldCallMode, strictMode, hintRequested } = parsed.data;
        const reading = await (0, storage_1.getReading)(readingId);
        if (!reading)
            return next((0, errorHandler_1.createError)("Reading not found", 404));
        // Cast zod-parsed messages to ChatMessage[] — roles are already validated as the correct literals
        const typedMessages = messages;
        const fullMessages = (0, prompts_1.socraticTutor)(reading.content, reading.title, typedMessages, {
            coldCall: coldCallMode,
            strict: strictMode,
            hint: hintRequested,
        });
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        await (0, groqClient_1.streamChatCompletion)(fullMessages, (chunk) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
        }, { temperature: 0.8, maxTokens: 1024 });
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
