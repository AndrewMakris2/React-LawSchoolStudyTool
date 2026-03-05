"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const storage_1 = require("../lib/storage");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const COURSES = [
    "Contracts", "Torts", "Civil Procedure", "Criminal Law", "Property", "Constitutional Law", "Other",
];
const CreateReadingSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    course: zod_1.z.enum(COURSES),
    content: zod_1.z.string().min(10),
});
const UpdateReadingSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).optional(),
    course: zod_1.z.enum(COURSES).optional(),
    content: zod_1.z.string().min(10).optional(),
    briefId: zod_1.z.string().optional(),
});
// GET /api/readings
router.get("/", async (_req, res, next) => {
    try {
        const readings = await (0, storage_1.getReadings)();
        const list = readings.map(({ id, title, course, dateAdded, briefId }) => ({
            id, title, course, dateAdded, briefId,
        }));
        res.json(list);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/readings/:id
router.get("/:id", async (req, res, next) => {
    try {
        const reading = await (0, storage_1.getReading)(req.params.id);
        if (!reading)
            return next((0, errorHandler_1.createError)("Reading not found", 404));
        res.json(reading);
    }
    catch (err) {
        next(err);
    }
});
// POST /api/readings
router.post("/", async (req, res, next) => {
    try {
        const parsed = CreateReadingSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const reading = {
            id: (0, uuid_1.v4)(),
            title: parsed.data.title,
            course: parsed.data.course,
            content: parsed.data.content,
            dateAdded: new Date().toISOString(),
        };
        await (0, storage_1.saveReading)(reading);
        res.status(201).json(reading);
    }
    catch (err) {
        next(err);
    }
});
// PUT /api/readings/:id
router.put("/:id", async (req, res, next) => {
    try {
        const existing = await (0, storage_1.getReading)(req.params.id);
        if (!existing)
            return next((0, errorHandler_1.createError)("Reading not found", 404));
        const parsed = UpdateReadingSchema.safeParse(req.body);
        if (!parsed.success)
            return next((0, errorHandler_1.createError)(parsed.error.message, 400));
        const updated = {
            ...existing,
            ...(parsed.data.title !== undefined && { title: parsed.data.title }),
            ...(parsed.data.course !== undefined && { course: parsed.data.course }),
            ...(parsed.data.content !== undefined && { content: parsed.data.content }),
            ...(parsed.data.briefId !== undefined && { briefId: parsed.data.briefId }),
        };
        await (0, storage_1.saveReading)(updated);
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
// DELETE /api/readings/:id
router.delete("/:id", async (req, res, next) => {
    try {
        const existing = await (0, storage_1.getReading)(req.params.id);
        if (!existing)
            return next((0, errorHandler_1.createError)("Reading not found", 404));
        await (0, storage_1.deleteReading)(req.params.id);
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
