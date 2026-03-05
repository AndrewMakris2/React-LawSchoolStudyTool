// In production the Vite proxy is not available so we hit the Render URL directly
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  readings: {
    list:   () => request<Reading[]>("/readings"),
    get:    (id: string) => request<Reading>(`/readings/${id}`),
    create: (data: { title: string; course: CourseTag; content: string }) =>
      request<Reading>("/readings", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Reading>) =>
      request<Reading>(`/readings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/readings/${id}`, { method: "DELETE" }),
  },

  brief: {
    list:     () => request<CaseBrief[]>("/brief"),
    get:      (id: string) => request<CaseBrief>(`/brief/${id}`),
    generate: (readingId: string) =>
      request<CaseBrief>("/brief", { method: "POST", body: JSON.stringify({ readingId }) }),
    update:   (id: string, data: Partial<CaseBrief>) =>
      request<CaseBrief>(`/brief/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  rulePolish: (userRule: string, style: PolishStyle, course?: CourseTag) =>
    request<{ polished: string }>("/rule-polish", {
      method: "POST",
      body: JSON.stringify({ userRule, style, course }),
    }),

  issueSpotter: {
    generate: (course: CourseTag, difficulty: Difficulty) =>
      request<{ hypothetical: string; issueCount: number; timeRecommendedMinutes: number }>(
        "/issue-spotter/generate",
        { method: "POST", body: JSON.stringify({ course, difficulty }) }
      ),
    grade: (data: {
      course: CourseTag;
      difficulty: Difficulty;
      prompt: string;
      userAnswer: string;
      timeSpentSeconds: number;
    }) =>
      request<GradeResult>("/issue-spotter/grade", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    history: () => request<DrillAttempt[]>("/issue-spotter/history"),
  },

  flashcards: {
    listDecks: () => request<FlashcardDeck[]>("/flashcards"),
    getCards:  (deckId: string) => request<Flashcard[]>(`/flashcards/${deckId}/cards`),
    generate:  (data: {
      name: string;
      course: CourseTag;
      sourceReadingId?: string;
      sourceBriefId?: string;
      cardCount?: number;
    }) =>
      request<{ deck: FlashcardDeck; cards: Flashcard[] }>("/flashcards", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    deleteDeck: (deckId: string) =>
      request<{ success: boolean }>(`/flashcards/${deckId}`, { method: "DELETE" }),
  },

  review: (cardId: string, grade: Grade) =>
    request<Flashcard>("/review", {
      method: "POST",
      body: JSON.stringify({ cardId, grade }),
    }),
};

// Streaming chat — hits Render URL directly in production
export async function streamChat(
  payload: {
    readingId: string;
    messages: { role: string; content: string }[];
    coldCallMode: boolean;
    strictMode: boolean;
    hintRequested: boolean;
  },
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  const url = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/chat`
    : "/api/chat";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    onError("Chat request failed");
    return;
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      try {
        const data = JSON.parse(line.slice(6));
        if (data.done) { onDone(); return; }
        if (data.chunk) onChunk(data.chunk);
      } catch {}
    }
  }
  onDone();
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type CourseTag =
  | "Contracts" | "Torts" | "Civil Procedure" | "Criminal Law"
  | "Property" | "Constitutional Law" | "Other";

export type PolishStyle = "concise" | "standard" | "verbose";
export type Grade       = "again" | "hard" | "good" | "easy";
export type Difficulty  = "easy" | "medium" | "hard";

export interface Reading {
  id: string; title: string; course: CourseTag; content: string;
  dateAdded: string; briefId?: string;
}
export interface CaseBrief {
  id: string; readingId: string; title: string; course: CourseTag;
  facts: string; proceduralHistory: string; issues: string; holding: string;
  rule: string; reasoning: string; disposition: string; notes: string;
  dateCreated: string; dateModified: string;
}
export interface Flashcard {
  id: string; deckId: string; front: string; back: string; hypo?: string;
  nextReview: string; interval: number; easeFactor: number;
  repetitions: number; lastGrade?: Grade;
}
export interface FlashcardDeck {
  id: string; name: string; course: CourseTag;
  sourceReadingId?: string; sourceBriefId?: string;
  dateCreated: string; cardCount: number;
}
export interface DrillAttempt {
  id: string; course: CourseTag; difficulty: Difficulty;
  prompt: string; userAnswer: string; score: DrillScore;
  modelOutline: string; suggestions: string[];
  dateAttempted: string; timeSpentSeconds: number;
}
export interface DrillScore {
  issueIdentification: number; ruleAccuracy: number;
  applicationQuality: number; organizationClarity: number; total: number;
}
export interface GradeResult {
  score: DrillScore;
  feedback: Record<string, string>;
  suggestions: string[];
  modelOutline: string;
  attemptId: string;
}
