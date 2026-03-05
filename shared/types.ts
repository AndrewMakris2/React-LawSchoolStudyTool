export type CourseTag =
  | "Contracts"
  | "Torts"
  | "Civil Procedure"
  | "Criminal Law"
  | "Property"
  | "Constitutional Law"
  | "Other";

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface Reading {
  id: string;
  title: string;
  course: CourseTag;
  content: string;
  dateAdded: string;
  briefId?: string;
}

export interface CaseBrief {
  id: string;
  readingId: string;
  title: string;
  course: CourseTag;
  facts: string;
  proceduralHistory: string;
  issues: string;
  holding: string;
  rule: string;
  reasoning: string;
  disposition: string;
  notes: string;
  dateCreated: string;
  dateModified: string;
}

export type PolishStyle = "concise" | "standard" | "verbose";

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hypo?: string;
  nextReview: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lastGrade?: Grade;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  course: CourseTag;
  sourceReadingId?: string;
  sourceBriefId?: string;
  dateCreated: string;
  cardCount: number;
}

export type Grade = "again" | "hard" | "good" | "easy";

export interface DrillAttempt {
  id: string;
  course: CourseTag;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  userAnswer: string;
  score: DrillScore;
  modelOutline: string;
  suggestions: string[];
  dateAttempted: string;
  timeSpentSeconds: number;
}

export interface DrillScore {
  issueIdentification: number;
  ruleAccuracy: number;
  applicationQuality: number;
  organizationClarity: number;
  total: number;
}

export interface ReviewRequest {
  cardId: string;
  grade: Grade;
}
