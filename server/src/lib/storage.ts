import fs from "fs/promises";
import path from "path";
import {
  Reading,
  CaseBrief,
  IracBrief,
  Flashcard,
  FlashcardDeck,
  DrillAttempt,
  ExamAttempt,
  GlossaryEntry,
  CourseOutline,
} from "../types";

export type { Reading, CaseBrief, IracBrief, Flashcard, FlashcardDeck, DrillAttempt, ExamAttempt, GlossaryEntry, CourseOutline };

const DATA_DIR = path.join(__dirname, "../../data");

const FILES = {
  readings:  path.join(DATA_DIR, "readings.json"),
  briefs:    path.join(DATA_DIR, "briefs.json"),
  iracBriefs: path.join(DATA_DIR, "iracBriefs.json"),
  flashcards: path.join(DATA_DIR, "flashcards.json"),
  decks:     path.join(DATA_DIR, "decks.json"),
  drills:    path.join(DATA_DIR, "drills.json"),
  exams:     path.join(DATA_DIR, "exams.json"),
  glossary:  path.join(DATA_DIR, "glossary.json"),
  outlines:  path.join(DATA_DIR, "outlines.json"),
};

export async function initStorage(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  for (const filePath of Object.values(FILES)) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify([]));
    }
  }
  await seedDemoData();
  console.log(`📁 Storage initialized at ${DATA_DIR}`);
}

async function readFile<T>(filePath: string): Promise<T[]> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T[];
}

async function writeFile<T>(filePath: string, data: T[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Every entity is stored in one flat JSON file shared by all users. Reads are
// filtered down to the caller's userId; writes always operate on the FULL
// unfiltered dataset (read raw, splice/filter just the caller's row, write
// the whole file back) so one user's save/delete never clobbers another
// user's rows sitting in the same file.

// ── Readings ──────────────────────────────────────────────────────────────────
export async function getReadings(userId: string): Promise<Reading[]> {
  return (await readFile<Reading>(FILES.readings)).filter((r) => r.userId === userId);
}
export async function getReading(id: string, userId: string): Promise<Reading | undefined> {
  return (await getReadings(userId)).find((r) => r.id === id);
}
export async function saveReading(reading: Reading): Promise<void> {
  const all = await readFile<Reading>(FILES.readings);
  const idx = all.findIndex((r) => r.id === reading.id && r.userId === reading.userId);
  if (idx === -1) all.push(reading);
  else all[idx] = reading;
  await writeFile(FILES.readings, all);
}
export async function deleteReading(id: string, userId: string): Promise<void> {
  const all = await readFile<Reading>(FILES.readings);
  await writeFile(FILES.readings, all.filter((r) => !(r.id === id && r.userId === userId)));
}

// ── Briefs ────────────────────────────────────────────────────────────────────
export async function getBriefs(userId: string): Promise<CaseBrief[]> {
  return (await readFile<CaseBrief>(FILES.briefs)).filter((b) => b.userId === userId);
}
export async function getBrief(id: string, userId: string): Promise<CaseBrief | undefined> {
  return (await getBriefs(userId)).find((b) => b.id === id);
}
export async function getBriefByReadingId(readingId: string, userId: string): Promise<CaseBrief | undefined> {
  return (await getBriefs(userId)).find((b) => b.readingId === readingId);
}
export async function saveBrief(brief: CaseBrief): Promise<void> {
  const all = await readFile<CaseBrief>(FILES.briefs);
  const idx = all.findIndex((b) => b.id === brief.id && b.userId === brief.userId);
  if (idx === -1) all.push(brief);
  else all[idx] = brief;
  await writeFile(FILES.briefs, all);
}

// ── IRAC Briefs ─────────────────────────────────────────────────────────────
export async function getIracBriefs(userId: string): Promise<IracBrief[]> {
  return (await readFile<IracBrief>(FILES.iracBriefs)).filter((b) => b.userId === userId);
}
export async function getIracBrief(id: string, userId: string): Promise<IracBrief | undefined> {
  return (await getIracBriefs(userId)).find((b) => b.id === id);
}
export async function saveIracBrief(brief: IracBrief): Promise<void> {
  const all = await readFile<IracBrief>(FILES.iracBriefs);
  const idx = all.findIndex((b) => b.id === brief.id && b.userId === brief.userId);
  if (idx === -1) all.push(brief);
  else all[idx] = brief;
  await writeFile(FILES.iracBriefs, all);
}

// ── Decks ─────────────────────────────────────────────────────────────────────
export async function getDecks(userId: string): Promise<FlashcardDeck[]> {
  return (await readFile<FlashcardDeck>(FILES.decks)).filter((d) => d.userId === userId);
}
export async function getDeck(id: string, userId: string): Promise<FlashcardDeck | undefined> {
  return (await getDecks(userId)).find((d) => d.id === id);
}
export async function saveDeck(deck: FlashcardDeck): Promise<void> {
  const all = await readFile<FlashcardDeck>(FILES.decks);
  const idx = all.findIndex((d) => d.id === deck.id && d.userId === deck.userId);
  if (idx === -1) all.push(deck);
  else all[idx] = deck;
  await writeFile(FILES.decks, all);
}
export async function deleteDeck(id: string, userId: string): Promise<void> {
  const allDecks = await readFile<FlashcardDeck>(FILES.decks);
  await writeFile(FILES.decks, allDecks.filter((d) => !(d.id === id && d.userId === userId)));
  const allCards = await readFile<Flashcard>(FILES.flashcards);
  await writeFile(FILES.flashcards, allCards.filter((c) => !(c.deckId === id && c.userId === userId)));
}

// ── Flashcards ────────────────────────────────────────────────────────────────
export async function getFlashcards(userId: string): Promise<Flashcard[]> {
  return (await readFile<Flashcard>(FILES.flashcards)).filter((c) => c.userId === userId);
}
export async function getFlashcardsByDeck(deckId: string, userId: string): Promise<Flashcard[]> {
  return (await getFlashcards(userId)).filter((c) => c.deckId === deckId);
}
export async function getFlashcard(id: string, userId: string): Promise<Flashcard | undefined> {
  return (await getFlashcards(userId)).find((c) => c.id === id);
}
export async function saveFlashcard(card: Flashcard): Promise<void> {
  const all = await readFile<Flashcard>(FILES.flashcards);
  const idx = all.findIndex((c) => c.id === card.id && c.userId === card.userId);
  if (idx === -1) all.push(card);
  else all[idx] = card;
  await writeFile(FILES.flashcards, all);
}
export async function saveFlashcards(cards: Flashcard[]): Promise<void> {
  const all = await readFile<Flashcard>(FILES.flashcards);
  for (const card of cards) {
    const idx = all.findIndex((c) => c.id === card.id && c.userId === card.userId);
    if (idx === -1) all.push(card);
    else all[idx] = card;
  }
  await writeFile(FILES.flashcards, all);
}

// ── Drills ────────────────────────────────────────────────────────────────────
export async function getDrillAttempts(userId: string): Promise<DrillAttempt[]> {
  return (await readFile<DrillAttempt>(FILES.drills)).filter((a) => a.userId === userId);
}
export async function saveDrillAttempt(attempt: DrillAttempt): Promise<void> {
  const all = await readFile<DrillAttempt>(FILES.drills);
  all.push(attempt);
  await writeFile(FILES.drills, all);
}

// ── Exams ─────────────────────────────────────────────────────────────────────
export async function getExamAttempts(userId: string): Promise<ExamAttempt[]> {
  return (await readFile<ExamAttempt>(FILES.exams)).filter((a) => a.userId === userId);
}
export async function saveExamAttempt(attempt: ExamAttempt): Promise<void> {
  const all = await readFile<ExamAttempt>(FILES.exams);
  all.push(attempt);
  await writeFile(FILES.exams, all);
}

// ── Glossary ──────────────────────────────────────────────────────────────────
export async function getGlossaryEntries(userId: string): Promise<GlossaryEntry[]> {
  return (await readFile<GlossaryEntry>(FILES.glossary)).filter((e) => e.userId === userId);
}
export async function saveGlossaryEntries(entries: GlossaryEntry[]): Promise<void> {
  const all = await readFile<GlossaryEntry>(FILES.glossary);
  for (const entry of entries) {
    const idx = all.findIndex((e) => e.id === entry.id && e.userId === entry.userId);
    if (idx === -1) all.push(entry);
    else all[idx] = entry;
  }
  await writeFile(FILES.glossary, all);
}
export async function deleteGlossaryEntry(id: string, userId: string): Promise<void> {
  const all = await readFile<GlossaryEntry>(FILES.glossary);
  await writeFile(FILES.glossary, all.filter((e) => !(e.id === id && e.userId === userId)));
}

// ── Outlines ──────────────────────────────────────────────────────────────────
export async function getOutlines(userId: string): Promise<CourseOutline[]> {
  return (await readFile<CourseOutline>(FILES.outlines)).filter((o) => o.userId === userId);
}
export async function saveOutline(outline: CourseOutline): Promise<void> {
  const all = await readFile<CourseOutline>(FILES.outlines);
  const idx = all.findIndex((o) => o.id === outline.id && o.userId === outline.userId);
  if (idx === -1) all.push(outline);
  else all[idx] = outline;
  await writeFile(FILES.outlines, all);
}
export async function deleteOutline(id: string, userId: string): Promise<void> {
  const all = await readFile<CourseOutline>(FILES.outlines);
  await writeFile(FILES.outlines, all.filter((o) => !(o.id === id && o.userId === userId)));
}

// ── Seed ──────────────────────────────────────────────────────────────────────
// Seed data is owned by the "local-dev" user (the dev-mode fallback identity)
// so it's visible during local development but not attributed to any real visitor.
const SEED_USER_ID = "local-dev";

async function seedDemoData(): Promise<void> {
  const readings = await readFile<Reading>(FILES.readings);
  if (readings.length > 0) return;

  const seed: Reading[] = [
    {
      id: "seed-reading-1",
      userId: SEED_USER_ID,
      title: "Palsgraf v. Long Island Railroad Co.",
      course: "Torts",
      dateAdded: new Date().toISOString(),
      content: `Palsgraf v. Long Island Railroad Co., 248 N.Y. 339, 162 N.E. 99 (1928)

FACTS:
Plaintiff Helen Palsgraf was standing on a platform of defendant's railroad. As a train began to pull away, a man carrying a package attempted to board it. Two railroad employees helped the man board — one pushed him from behind while another on the platform pulled him forward. During this process, the man dropped his package, which contained fireworks. The fireworks exploded, causing scales at the other end of the platform to fall, injuring Palsgraf.

PROCEDURAL HISTORY:
The trial court found for the plaintiff. The Appellate Division affirmed. The Court of Appeals granted certiorari.

ISSUE:
Whether the railroad employees' negligent conduct toward the man with the package was the proximate cause of injuries to Palsgraf, who was standing some distance away on the platform.

HOLDING:
The Court of Appeals reversed, holding that the railroad was not liable to Palsgraf. Negligence must be negligence in relation to the plaintiff — a duty must be owed to the plaintiff herself.

REASONING (CARDOZO, C.J.):
The risk reasonably to be perceived defines the duty to be obeyed. There was nothing to suggest the parcel concealed a bomb. The act causing the explosion bore no relationship to the plaintiff standing far away. Negligence is not actionable unless it involves the invasion of a legally protected interest.

DISSENT (ANDREWS, J.):
When a person acts negligently, they are liable to all those injured as a result of that negligence. Proximate cause is a matter of policy, not pure logic.

DISPOSITION:
Reversed. Judgment for defendant railroad.`,
    },
    {
      id: "seed-reading-2",
      userId: SEED_USER_ID,
      title: "Hadley v. Baxendale",
      course: "Contracts",
      dateAdded: new Date().toISOString(),
      content: `Hadley v. Baxendale, 9 Exch. 341, 156 Eng. Rep. 145 (1854)

FACTS:
Plaintiffs operated a flour mill in Gloucester. A crankshaft broke, halting operations. Plaintiffs contracted with defendant carrier Baxendale to transport the broken shaft to the manufacturer. Plaintiffs' employee told Baxendale's clerk the mill was stopped and the shaft had to be sent immediately. Baxendale promised delivery in one day but delayed several days, causing extended lost profits.

PROCEDURAL HISTORY:
The trial court found for plaintiff and awarded lost profits. Defendant appealed.

ISSUE:
Whether lost profits from the mill's extended closure are recoverable as damages for breach of the delivery contract.

HOLDING:
Lost profits were not recoverable because they were not within the reasonable contemplation of the parties at the time of contract formation.

RULE:
Damages should be: (1) arising naturally from the breach, or (2) such as may reasonably be supposed to have been in the contemplation of both parties at contract formation as the probable result of breach.

REASONING:
The special circumstances were never communicated to Baxendale such that lost profits were a foreseeable consequence. Under ordinary circumstances a mill owner might have a spare crankshaft.

DISPOSITION:
New trial ordered; lost profits damages were improperly awarded.`,
    },
  ];

  for (const r of seed) await saveReading(r);
  console.log("🌱 Seeded demo readings (Palsgraf + Hadley v. Baxendale) for local-dev user");
}
