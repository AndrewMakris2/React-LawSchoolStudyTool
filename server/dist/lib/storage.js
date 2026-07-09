"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initStorage = initStorage;
exports.getReadings = getReadings;
exports.getReading = getReading;
exports.saveReading = saveReading;
exports.deleteReading = deleteReading;
exports.getBriefs = getBriefs;
exports.getBrief = getBrief;
exports.getBriefByReadingId = getBriefByReadingId;
exports.saveBrief = saveBrief;
exports.getDecks = getDecks;
exports.getDeck = getDeck;
exports.saveDeck = saveDeck;
exports.deleteDeck = deleteDeck;
exports.getFlashcards = getFlashcards;
exports.getFlashcardsByDeck = getFlashcardsByDeck;
exports.getFlashcard = getFlashcard;
exports.saveFlashcard = saveFlashcard;
exports.saveFlashcards = saveFlashcards;
exports.getDrillAttempts = getDrillAttempts;
exports.saveDrillAttempt = saveDrillAttempt;
exports.getExamAttempts = getExamAttempts;
exports.saveExamAttempt = saveExamAttempt;
exports.getGlossaryEntries = getGlossaryEntries;
exports.saveGlossaryEntries = saveGlossaryEntries;
exports.deleteGlossaryEntry = deleteGlossaryEntry;
exports.getOutlines = getOutlines;
exports.saveOutline = saveOutline;
exports.deleteOutline = deleteOutline;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(__dirname, "../../data");
const FILES = {
    readings: path_1.default.join(DATA_DIR, "readings.json"),
    briefs: path_1.default.join(DATA_DIR, "briefs.json"),
    flashcards: path_1.default.join(DATA_DIR, "flashcards.json"),
    decks: path_1.default.join(DATA_DIR, "decks.json"),
    drills: path_1.default.join(DATA_DIR, "drills.json"),
    exams: path_1.default.join(DATA_DIR, "exams.json"),
    glossary: path_1.default.join(DATA_DIR, "glossary.json"),
    outlines: path_1.default.join(DATA_DIR, "outlines.json"),
};
async function initStorage() {
    await promises_1.default.mkdir(DATA_DIR, { recursive: true });
    for (const filePath of Object.values(FILES)) {
        try {
            await promises_1.default.access(filePath);
        }
        catch {
            await promises_1.default.writeFile(filePath, JSON.stringify([]));
        }
    }
    await seedDemoData();
    console.log(`📁 Storage initialized at ${DATA_DIR}`);
}
async function readFile(filePath) {
    const raw = await promises_1.default.readFile(filePath, "utf-8");
    return JSON.parse(raw);
}
async function writeFile(filePath, data) {
    await promises_1.default.writeFile(filePath, JSON.stringify(data, null, 2));
}
// Every entity is stored in one flat JSON file shared by all users. Reads are
// filtered down to the caller's userId; writes always operate on the FULL
// unfiltered dataset (read raw, splice/filter just the caller's row, write
// the whole file back) so one user's save/delete never clobbers another
// user's rows sitting in the same file.
// ── Readings ──────────────────────────────────────────────────────────────────
async function getReadings(userId) {
    return (await readFile(FILES.readings)).filter((r) => r.userId === userId);
}
async function getReading(id, userId) {
    return (await getReadings(userId)).find((r) => r.id === id);
}
async function saveReading(reading) {
    const all = await readFile(FILES.readings);
    const idx = all.findIndex((r) => r.id === reading.id && r.userId === reading.userId);
    if (idx === -1)
        all.push(reading);
    else
        all[idx] = reading;
    await writeFile(FILES.readings, all);
}
async function deleteReading(id, userId) {
    const all = await readFile(FILES.readings);
    await writeFile(FILES.readings, all.filter((r) => !(r.id === id && r.userId === userId)));
}
// ── Briefs ────────────────────────────────────────────────────────────────────
async function getBriefs(userId) {
    return (await readFile(FILES.briefs)).filter((b) => b.userId === userId);
}
async function getBrief(id, userId) {
    return (await getBriefs(userId)).find((b) => b.id === id);
}
async function getBriefByReadingId(readingId, userId) {
    return (await getBriefs(userId)).find((b) => b.readingId === readingId);
}
async function saveBrief(brief) {
    const all = await readFile(FILES.briefs);
    const idx = all.findIndex((b) => b.id === brief.id && b.userId === brief.userId);
    if (idx === -1)
        all.push(brief);
    else
        all[idx] = brief;
    await writeFile(FILES.briefs, all);
}
// ── Decks ─────────────────────────────────────────────────────────────────────
async function getDecks(userId) {
    return (await readFile(FILES.decks)).filter((d) => d.userId === userId);
}
async function getDeck(id, userId) {
    return (await getDecks(userId)).find((d) => d.id === id);
}
async function saveDeck(deck) {
    const all = await readFile(FILES.decks);
    const idx = all.findIndex((d) => d.id === deck.id && d.userId === deck.userId);
    if (idx === -1)
        all.push(deck);
    else
        all[idx] = deck;
    await writeFile(FILES.decks, all);
}
async function deleteDeck(id, userId) {
    const allDecks = await readFile(FILES.decks);
    await writeFile(FILES.decks, allDecks.filter((d) => !(d.id === id && d.userId === userId)));
    const allCards = await readFile(FILES.flashcards);
    await writeFile(FILES.flashcards, allCards.filter((c) => !(c.deckId === id && c.userId === userId)));
}
// ── Flashcards ────────────────────────────────────────────────────────────────
async function getFlashcards(userId) {
    return (await readFile(FILES.flashcards)).filter((c) => c.userId === userId);
}
async function getFlashcardsByDeck(deckId, userId) {
    return (await getFlashcards(userId)).filter((c) => c.deckId === deckId);
}
async function getFlashcard(id, userId) {
    return (await getFlashcards(userId)).find((c) => c.id === id);
}
async function saveFlashcard(card) {
    const all = await readFile(FILES.flashcards);
    const idx = all.findIndex((c) => c.id === card.id && c.userId === card.userId);
    if (idx === -1)
        all.push(card);
    else
        all[idx] = card;
    await writeFile(FILES.flashcards, all);
}
async function saveFlashcards(cards) {
    const all = await readFile(FILES.flashcards);
    for (const card of cards) {
        const idx = all.findIndex((c) => c.id === card.id && c.userId === card.userId);
        if (idx === -1)
            all.push(card);
        else
            all[idx] = card;
    }
    await writeFile(FILES.flashcards, all);
}
// ── Drills ────────────────────────────────────────────────────────────────────
async function getDrillAttempts(userId) {
    return (await readFile(FILES.drills)).filter((a) => a.userId === userId);
}
async function saveDrillAttempt(attempt) {
    const all = await readFile(FILES.drills);
    all.push(attempt);
    await writeFile(FILES.drills, all);
}
// ── Exams ─────────────────────────────────────────────────────────────────────
async function getExamAttempts(userId) {
    return (await readFile(FILES.exams)).filter((a) => a.userId === userId);
}
async function saveExamAttempt(attempt) {
    const all = await readFile(FILES.exams);
    all.push(attempt);
    await writeFile(FILES.exams, all);
}
// ── Glossary ──────────────────────────────────────────────────────────────────
async function getGlossaryEntries(userId) {
    return (await readFile(FILES.glossary)).filter((e) => e.userId === userId);
}
async function saveGlossaryEntries(entries) {
    const all = await readFile(FILES.glossary);
    for (const entry of entries) {
        const idx = all.findIndex((e) => e.id === entry.id && e.userId === entry.userId);
        if (idx === -1)
            all.push(entry);
        else
            all[idx] = entry;
    }
    await writeFile(FILES.glossary, all);
}
async function deleteGlossaryEntry(id, userId) {
    const all = await readFile(FILES.glossary);
    await writeFile(FILES.glossary, all.filter((e) => !(e.id === id && e.userId === userId)));
}
// ── Outlines ──────────────────────────────────────────────────────────────────
async function getOutlines(userId) {
    return (await readFile(FILES.outlines)).filter((o) => o.userId === userId);
}
async function saveOutline(outline) {
    const all = await readFile(FILES.outlines);
    const idx = all.findIndex((o) => o.id === outline.id && o.userId === outline.userId);
    if (idx === -1)
        all.push(outline);
    else
        all[idx] = outline;
    await writeFile(FILES.outlines, all);
}
async function deleteOutline(id, userId) {
    const all = await readFile(FILES.outlines);
    await writeFile(FILES.outlines, all.filter((o) => !(o.id === id && o.userId === userId)));
}
// ── Seed ──────────────────────────────────────────────────────────────────────
// Seed data is owned by the "local-dev" user (the dev-mode fallback identity)
// so it's visible during local development but not attributed to any real visitor.
const SEED_USER_ID = "local-dev";
async function seedDemoData() {
    const readings = await readFile(FILES.readings);
    if (readings.length > 0)
        return;
    const seed = [
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
    for (const r of seed)
        await saveReading(r);
    console.log("🌱 Seeded demo readings (Palsgraf + Hadley v. Baxendale) for local-dev user");
}
