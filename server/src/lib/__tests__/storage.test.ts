import fs from "fs/promises";
import path from "path";
import os from "os";

// We'll test the spaced repetition logic and storage helpers in isolation

// ── Test 1: SM-2 scheduling logic ────────────────────────────────────────────
import { Grade, Flashcard } from "../../../../shared/types";

function scheduleCard(card: Flashcard, grade: Grade): Flashcard {
  const gradeMap = { again: 0, hard: 1, good: 3, easy: 5 };
  const q = gradeMap[grade];
  let { easeFactor, interval, repetitions } = card;

  if (q < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { ...card, easeFactor, interval, repetitions, lastGrade: grade, nextReview: nextReview.toISOString() };
}

function makeCard(overrides: Partial<Flashcard> = {}): Flashcard {
  return {
    id: "test-card",
    deckId: "test-deck",
    front: "What is the rule in Palsgraf?",
    back: "Duty is owed only to foreseeable plaintiffs.",
    nextReview: new Date().toISOString(),
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    ...overrides,
  };
}

describe("SM-2 Scheduling", () => {
  test("grade 'again' resets repetitions and interval to 1", () => {
    const card = makeCard({ repetitions: 5, interval: 21, easeFactor: 2.5 });
    const result = scheduleCard(card, "again");
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.lastGrade).toBe("again");
  });

  test("grade 'easy' on first rep sets interval to 1 and increases easeFactor", () => {
    const card = makeCard({ repetitions: 0, interval: 1, easeFactor: 2.5 });
    const result = scheduleCard(card, "easy");
    expect(result.repetitions).toBe(1);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBeGreaterThan(2.5);
    expect(result.lastGrade).toBe("easy");
  });

  test("grade 'good' on second rep sets interval to 6", () => {
    const card = makeCard({ repetitions: 1, interval: 1, easeFactor: 2.5 });
    const result = scheduleCard(card, "good");
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
  });

  test("grade 'hard' resets repetitions", () => {
    const card = makeCard({ repetitions: 3, interval: 12, easeFactor: 2.5 });
    const result = scheduleCard(card, "hard");
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
  });

  test("easeFactor never drops below 1.3", () => {
    let card = makeCard({ easeFactor: 1.31 });
    // Multiple "again" grades should floor at 1.3
    card = scheduleCard(card, "again");
    card = scheduleCard(card, "again");
    card = scheduleCard(card, "again");
    expect(card.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  test("nextReview date is in the future after any grade", () => {
    const card = makeCard();
    const now = new Date();
    const result = scheduleCard(card, "good");
    expect(new Date(result.nextReview).getTime()).toBeGreaterThanOrEqual(now.getTime());
  });
});

// ── Test 2: JSON file read/write helpers ──────────────────────────────────────
describe("Storage file helpers", () => {
  let tmpDir: string;

  beforeAll(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "law-study-test-"));
  });

  afterAll(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  async function writeJson<T>(file: string, data: T[]): Promise<void> {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
  }

  async function readJson<T>(file: string): Promise<T[]> {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T[];
  }

  test("writes and reads JSON array correctly", async () => {
    const file = path.join(tmpDir, "test.json");
    const data = [{ id: "1", name: "Palsgraf" }, { id: "2", name: "Hadley" }];
    await writeJson(file, data);
    const result = await readJson<{ id: string; name: string }>(file);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Palsgraf");
  });

  test("overwrites existing file on second write", async () => {
    const file = path.join(tmpDir, "overwrite.json");
    await writeJson(file, [{ id: "1" }]);
    await writeJson(file, [{ id: "2" }, { id: "3" }]);
    const result = await readJson<{ id: string }>(file);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("2");
  });

  test("empty array writes and reads back as empty", async () => {
    const file = path.join(tmpDir, "empty.json");
    await writeJson(file, []);
    const result = await readJson<unknown>(file);
    expect(result).toEqual([]);
  });

  test("upsert logic: updates existing item by id", async () => {
    const file = path.join(tmpDir, "upsert.json");
    const items = [{ id: "a", val: 1 }, { id: "b", val: 2 }];
    await writeJson(file, items);

    const all = await readJson<{ id: string; val: number }>(file);
    const idx = all.findIndex((x) => x.id === "a");
    all[idx] = { id: "a", val: 99 };
    await writeJson(file, all);

    const result = await readJson<{ id: string; val: number }>(file);
    expect(result.find((x) => x.id === "a")?.val).toBe(99);
    expect(result.find((x) => x.id === "b")?.val).toBe(2);
  });
});