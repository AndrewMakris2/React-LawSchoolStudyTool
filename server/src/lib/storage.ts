import fs from "fs/promises";
import path from "path";
import {
  Reading,
  CaseBrief,
  Flashcard,
  FlashcardDeck,
  DrillAttempt,
} from "../../../shared/types";

export type { Reading, CaseBrief, Flashcard, FlashcardDeck, DrillAttempt };

const DATA_DIR = path.join(__dirname, "../../data");

const FILES = {
  readings: path.join(DATA_DIR, "readings.json"),
  briefs:   path.join(DATA_DIR, "briefs.json"),
  flashcards: path.join(DATA_DIR, "flashcards.json"),
  decks:    path.join(DATA_DIR, "decks.json"),
  drills:   path.join(DATA_DIR, "drills.json"),
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

// ── Readings ──────────────────────────────────────────────────────────────────
export async function getReadings(): Promise<Reading[]> {
  return readFile<Reading>(FILES.readings);
}
export async function getReading(id: string): Promise<Reading | undefined> {
  return (await getReadings()).find((r) => r.id === id);
}
export async function saveReading(reading: Reading): Promise<void> {
  const all = await getReadings();
  const idx = all.findIndex((r) => r.id === reading.id);
  if (idx === -1) all.push(reading);
  else all[idx] = reading;
  await writeFile(FILES.readings, all);
}
export async function deleteReading(id: string): Promise<void> {
  const all = await getReadings();
  await writeFile(FILES.readings, all.filter((r) => r.id !== id));
}

// ── Briefs ────────────────────────────────────────────────────────────────────
export async function getBriefs(): Promise<CaseBrief[]> {
  return readFile<CaseBrief>(FILES.briefs);
}
export async function getBrief(id: string): Promise<CaseBrief | undefined> {
  return (await getBriefs()).find((b) => b.id === id);
}
export async function getBriefByReadingId(readingId: string): Promise<CaseBrief | undefined> {
  return (await getBriefs()).find((b) => b.readingId === readingId);
}
export async function saveBrief(brief: CaseBrief): Promise<void> {
  const all = await getBriefs();
  const idx = all.findIndex((b) => b.id === brief.id);
  if (idx === -1) all.push(brief);
  else all[idx] = brief;
  await writeFile(FILES.briefs, all);
}

// ── Decks ─────────────────────────────────────────────────────────────────────
export async function getDecks(): Promise<FlashcardDeck[]> {
  return readFile<FlashcardDeck>(FILES.decks);
}
export async function getDeck(id: string): Promise<FlashcardDeck | undefined> {
  return (await getDecks()).find((d) => d.id === id);
}
export async function saveDeck(deck: FlashcardDeck): Promise<void> {
  const all = await getDecks();
  const idx = all.findIndex((d) => d.id === deck.id);
  if (idx === -1) all.push(deck);
  else all[idx] = deck;
  await writeFile(FILES.decks, all);
}
export async function deleteDeck(id: string): Promise<void> {
  await writeFile(FILES.decks, (await getDecks()).filter((d) => d.id !== id));
  await writeFile(FILES.flashcards, (await getFlashcards()).filter((c) => c.deckId !== id));
}

// ── Flashcards ────────────────────────────────────────────────────────────────
export async function getFlashcards(): Promise<Flashcard[]> {
  return readFile<Flashcard>(FILES.flashcards);
}
export async function getFlashcardsByDeck(deckId: string): Promise<Flashcard[]> {
  return (await getFlashcards()).filter((c) => c.deckId === deckId);
}
export async function getFlashcard(id: string): Promise<Flashcard | undefined> {
  return (await getFlashcards()).find((c) => c.id === id);
}
export async function saveFlashcard(card: Flashcard): Promise<void> {
  const all = await getFlashcards();
  const idx = all.findIndex((c) => c.id === card.id);
  if (idx === -1) all.push(card);
  else all[idx] = card;
  await writeFile(FILES.flashcards, all);
}
export async function saveFlashcards(cards: Flashcard[]): Promise<void> {
  const all = await getFlashcards();
  for (const card of cards) {
    const idx = all.findIndex((c) => c.id === card.id);
    if (idx === -1) all.push(card);
    else all[idx] = card;
  }
  await writeFile(FILES.flashcards, all);
}

// ── Drills ────────────────────────────────────────────────────────────────────
export async function getDrillAttempts(): Promise<DrillAttempt[]> {
  return readFile<DrillAttempt>(FILES.drills);
}
export async function saveDrillAttempt(attempt: DrillAttempt): Promise<void> {
  const all = await getDrillAttempts();
  all.push(attempt);
  await writeFile(FILES.drills, all);
}

// ── Seed ──────────────────────────────────────────────────────────────────────
async function seedDemoData(): Promise<void> {
  const readings = await getReadings();
  if (readings.length > 0) return;

  const seed: Reading[] = [
    {
      id: "seed-reading-1",
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
  console.log("🌱 Seeded demo readings (Palsgraf + Hadley v. Baxendale)");
}