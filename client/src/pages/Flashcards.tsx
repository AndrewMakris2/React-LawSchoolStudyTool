import React, { useEffect, useState } from "react";
import { api, FlashcardDeck, Flashcard, Reading, CaseBrief, CourseTag, Grade } from "../api/client";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { CreditCard, Plus, Trash2, Play, RotateCcw, ChevronRight } from "lucide-react";

const COURSES: CourseTag[] = [
  "Contracts","Torts","Civil Procedure","Criminal Law","Property","Constitutional Law","Other",
];

type View = "decks" | "review";

export function Flashcards() {
  const [view, setView]             = useState<View>("decks");
  const [decks, setDecks]           = useState<FlashcardDeck[]>([]);
  const [readings, setReadings]     = useState<Reading[]>([]);
  const [briefs, setBriefs]         = useState<CaseBrief[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showGenerate, setShowGen]  = useState(false);
  const [error, setError]           = useState("");

  // Generate form
  const [genName, setGenName]       = useState("");
  const [genCourse, setGenCourse]   = useState<CourseTag>("Contracts");
  const [genSource, setGenSource]   = useState<"reading" | "brief">("reading");
  const [genReadingId, setGenRId]   = useState("");
  const [genBriefId, setGenBId]     = useState("");
  const [genCount, setGenCount]     = useState(8);
  const [generating, setGenerating] = useState(false);

  // Review state
  const [reviewDeck, setReviewDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards]           = useState<Flashcard[]>([]);
  const [cardIndex, setCardIndex]   = useState(0);
  const [flipped, setFlipped]       = useState(false);
  const [showHypo, setShowHypo]     = useState(false);
  const [reviewing, setReviewing]   = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [grading, setGrading]       = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [d, r, b] = await Promise.all([
        api.flashcards.listDecks(),
        api.readings.list(),
        api.brief.list(),
      ]);
      setDecks(d);
      setReadings(r);
      setBriefs(b);
      if (r.length > 0) setGenRId(r[0].id);
      if (b.length > 0) setGenBId(b[0].id);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleGenerate = async () => {
    if (!genName.trim()) return;
    try {
      setGenerating(true);
      setError("");
      const payload = {
        name: genName.trim(),
        course: genCourse,
        cardCount: genCount,
        ...(genSource === "reading" ? { sourceReadingId: genReadingId } : { sourceBriefId: genBriefId }),
      };
      const { deck } = await api.flashcards.generate(payload);
      setDecks((prev) => [deck, ...prev]);
      setShowGen(false);
      setGenName("");
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteDeck = async (id: string) => {
    try {
      await api.flashcards.deleteDeck(id);
      setDecks((prev) => prev.filter((d) => d.id !== id));
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  };

  const startReview = async (deck: FlashcardDeck) => {
    try {
      setReviewing(true);
      const allCards = await api.flashcards.getCards(deck.id);
      const now = new Date();
      // Only cards due for review
      const due = allCards.filter((c) => new Date(c.nextReview) <= now);
      const reviewQueue = due.length > 0 ? due : allCards; // if none due, show all
      setCards(reviewQueue);
      setReviewDeck(deck);
      setCardIndex(0);
      setFlipped(false);
      setShowHypo(false);
      setSessionDone(false);
      setView("review");
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setReviewing(false);
    }
  };

  const handleGrade = async (grade: Grade) => {
    const card = cards[cardIndex];
    if (!card) return;
    try {
      setGrading(true);
      const updated = await api.review(card.id, grade);
      setCards((prev) => prev.map((c) => c.id === updated.id ? updated : c));
      if (cardIndex + 1 >= cards.length) {
        setSessionDone(true);
      } else {
        setCardIndex((i) => i + 1);
        setFlipped(false);
        setShowHypo(false);
      }
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setGrading(false);
    }
  };

  const GRADE_BUTTONS: { grade: Grade; label: string; color: string }[] = [
    { grade: "again", label: "Again",  color: "bg-red-700 hover:bg-red-600 text-white" },
    { grade: "hard",  label: "Hard",   color: "bg-orange-700 hover:bg-orange-600 text-white" },
    { grade: "good",  label: "Good",   color: "bg-blue-700 hover:bg-blue-600 text-white" },
    { grade: "easy",  label: "Easy",   color: "bg-green-700 hover:bg-green-600 text-white" },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner label="Loading..." /></div>;
  }

  // ── Review View ─────────────────────────────────────────────────────────────
  if (view === "review" && reviewDeck) {
    const card = cards[cardIndex];

    if (sessionDone || cards.length === 0) {
      return (
        <div className="p-8 max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-gray-100 mb-2">Session Complete!</h2>
          <p className="text-gray-400 mb-2">You reviewed {cards.length} cards from</p>
          <p className="text-law-300 font-semibold mb-8">{reviewDeck.name}</p>
          <Button onClick={() => { setView("decks"); setReviewDeck(null); }}>
            Back to Decks
          </Button>
        </div>
      );
    }

    return (
      <div className="p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-semibold text-gray-100">{reviewDeck.name}</h2>
            <p className="text-sm text-gray-500">
              Card {cardIndex + 1} of {cards.length}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setView("decks")}>
            ← Exit
          </Button>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-800 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-law-600 rounded-full transition-all"
            style={{ width: `${((cardIndex) / cards.length) * 100}%` }}
          />
        </div>

        {/* Card */}
        <div className="min-h-[280px] bg-gray-900 border border-gray-800 rounded-2xl p-7 mb-5 flex flex-col">
          <p className="text-xs text-law-400 font-semibold uppercase tracking-wide mb-4">
            {flipped ? "Answer" : "Question"}
          </p>
          <div className="flex-1 flex items-center">
            <p className="text-gray-100 text-base leading-relaxed whitespace-pre-wrap">
              {flipped ? card.back : card.front}
            </p>
          </div>

          {flipped && card.hypo && (
            <div className="mt-4 pt-4 border-t border-gray-800">
              <button
                onClick={() => setShowHypo((v) => !v)}
                className="flex items-center gap-1.5 text-xs text-law-400 hover:text-law-300 transition-colors"
              >
                <ChevronRight size={14} className={showHypo ? "rotate-90" : ""} />
                Hypo Variation
              </button>
              {showHypo && (
                <p className="mt-2 text-sm text-gray-400 italic leading-relaxed">{card.hypo}</p>
              )}
            </div>
          )}
        </div>

        {!flipped ? (
          <Button className="w-full" size="lg" onClick={() => setFlipped(true)}>
            Reveal Answer
          </Button>
        ) : (
          <div>
            <p className="text-center text-xs text-gray-500 mb-3">How well did you know this?</p>
            <div className="grid grid-cols-4 gap-2">
              {GRADE_BUTTONS.map(({ grade, label, color }) => (
                <button
                  key={grade}
                  disabled={grading}
                  onClick={() => handleGrade(grade)}
                  className={`py-3 rounded-xl text-sm font-semibold transition-all ${color} disabled:opacity-50`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-400 text-center">{error}</p>
        )}
      </div>
    );
  }

  // ── Decks View ──────────────────────────────────────────────────────────────
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <CreditCard className="text-law-400" size={26} /> Flashcards
          </h1>
          <p className="text-gray-400 text-sm mt-1">Spaced repetition decks from your readings</p>
        </div>
        <Button onClick={() => setShowGen(true)}>
          <Plus size={16} /> New Deck
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      {decks.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
          <p>No decks yet. Generate one from a reading or brief.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <Card key={deck.id} className="flex flex-col gap-4">
              <div className="flex-1">
                <Badge label={deck.course} variant="course" />
                <h3 className="font-semibold text-gray-100 mt-2 leading-snug">{deck.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {deck.cardCount} cards · {new Date(deck.dateCreated).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  loading={reviewing}
                  onClick={() => startReview(deck)}
                >
                  <Play size={13} /> Study
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={() => handleDeleteDeck(deck.id)}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Generate Deck Modal */}
      <Modal open={showGenerate} onClose={() => setShowGen(false)} title="Generate Flashcard Deck" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Deck Name</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-law-500"
              placeholder="e.g. Torts — Proximate Cause"
              value={genName}
              onChange={(e) => setGenName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Course</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-law-500"
              value={genCourse}
              onChange={(e) => setGenCourse(e.target.value as CourseTag)}
            >
              {COURSES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Source</label>
            <div className="flex gap-2 mb-3">
              {(["reading","brief"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setGenSource(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    genSource === s
                      ? "bg-law-700 border-law-600 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {genSource === "reading" ? (
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-law-500"
                value={genReadingId}
                onChange={(e) => setGenRId(e.target.value)}
              >
                {readings.length === 0 && <option value="">No readings available</option>}
                {readings.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
              </select>
            ) : (
              <select
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-law-500"
                value={genBriefId}
                onChange={(e) => setGenBId(e.target.value)}
              >
                {briefs.length === 0 && <option value="">No briefs available</option>}
                {briefs.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Number of Cards: {genCount}
            </label>
            <input
              type="range" min={3} max={20} value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
              className="w-full accent-law-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>3</span><span>20</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowGen(false)}>Cancel</Button>
            <Button loading={generating} onClick={handleGenerate}>
              Generate Deck
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}