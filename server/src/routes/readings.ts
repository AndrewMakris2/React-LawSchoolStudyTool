import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { v4 as uuid } from "uuid";
import { getReadings, getReading, saveReading, deleteReading } from "../lib/storage";
import { createError } from "../middleware/errorHandler";
import { CourseTag, Reading } from "../types";

const router = Router();

const COURSES: CourseTag[] = [
  "Contracts","Torts","Civil Procedure","Criminal Law","Property","Constitutional Law","Other",
];

const CreateReadingSchema = z.object({
  title:   z.string().min(1).max(200),
  course:  z.enum(COURSES as [CourseTag, ...CourseTag[]]),
  content: z.string().min(10),
});

const UpdateReadingSchema = z.object({
  title:   z.string().min(1).max(200).optional(),
  course:  z.enum(COURSES as [CourseTag, ...CourseTag[]]).optional(),
  content: z.string().min(10).optional(),
  briefId: z.string().optional(),
});

// GET /api/readings
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const readings = await getReadings();
    const list = readings.map(({ id, title, course, dateAdded, briefId }) => ({
      id, title, course, dateAdded, briefId,
    }));
    res.json(list);
  } catch (err) { next(err); }
});

// GET /api/readings/:id
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reading = await getReading(req.params.id);
    if (!reading) return next(createError("Reading not found", 404));
    res.json(reading);
  } catch (err) { next(err); }
});

// POST /api/readings
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = CreateReadingSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const reading: Reading = {
      id: uuid(),
      title:     parsed.data.title,
      course:    parsed.data.course,
      content:   parsed.data.content,
      dateAdded: new Date().toISOString(),
    };
    await saveReading(reading);
    res.status(201).json(reading);
  } catch (err) { next(err); }
});

// PUT /api/readings/:id
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await getReading(req.params.id);
    if (!existing) return next(createError("Reading not found", 404));

    const parsed = UpdateReadingSchema.safeParse(req.body);
    if (!parsed.success) return next(createError(parsed.error.message, 400));

    const updated: Reading = {
      ...existing,
      ...(parsed.data.title   !== undefined && { title:   parsed.data.title }),
      ...(parsed.data.course  !== undefined && { course:  parsed.data.course }),
      ...(parsed.data.content !== undefined && { content: parsed.data.content }),
      ...(parsed.data.briefId !== undefined && { briefId: parsed.data.briefId }),
    };
    await saveReading(updated);
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/readings/:id
router.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await getReading(req.params.id);
    if (!existing) return next(createError("Reading not found", 404));
    await deleteReading(req.params.id);
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
