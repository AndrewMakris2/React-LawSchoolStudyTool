"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const groqClient_1 = require("../lib/groqClient");
const prompts_1 = require("../lib/prompts");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const COURSES = [
    "Contracts", "Torts", "Civil Procedure", "Criminal Law", "Property", "Constitutional Law", "Other",
];
const RulePolishSchema = zod_1.z.object({
    userRule: zod_1.z.string().min(5),
    style: zod_1.z.enum(["concise", "standard", "verbose"]),
    course: zod_1.z.enum(COURSES).optional(),
});
router.post("/", async (req, res, next) => {
    try {
        const parsed = RulePolishSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const { userRule, style, course } = parsed.data;
        const messages = (0, prompts_1.rulePolisher)(userRule, style, course);
        const result = await (0, groqClient_1.chatCompletion)(messages, { temperature: 0.4, maxTokens: 512 });
        res.json({ polished: result.trim() });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
