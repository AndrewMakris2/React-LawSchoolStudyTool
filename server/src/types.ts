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

// ── Practice Exams ──────────────────────────────────────────────────────────

export type ExamQuestionType = "mc" | "essay";

export interface ExamQuestion {
  id: string;
  type: ExamQuestionType;
  text: string;
  options?: string[];      // 4 options for MC
  correctAnswer?: string;  // For MC: the correct option text
  points: number;
}

export interface ExamAttempt {
  id: string;
  course: CourseTag;
  difficulty: "easy" | "medium" | "hard";
  questions: ExamQuestion[];
  answers: Record<string, string>;  // questionId -> answer text
  feedback: ExamQuestionFeedback[];
  totalScore: number;
  maxScore: number;
  dateAttempted: string;
  timeSpentSeconds: number;
}

export interface ExamQuestionFeedback {
  questionId: string;
  score: number;
  maxScore: number;
  feedback: string;
  correct?: boolean;  // for MC
}

// ── Glossary ────────────────────────────────────────────────────────────────

export interface GlossaryEntry {
  id: string;
  term: string;
  definition: string;
  example?: string;
  course: CourseTag;
  sourceReadingId?: string;
  dateAdded: string;
}

// ── Outline ─────────────────────────────────────────────────────────────────

export interface OutlineSubtopic {
  title: string;
  rule: string;
  cases: string[];
  notes?: string;
}

export interface OutlineTopic {
  title: string;
  subtopics: OutlineSubtopic[];
}

export interface CourseOutline {
  id: string;
  course: CourseTag;
  title: string;
  topics: OutlineTopic[];
  sourceReadingIds: string[];
  dateCreated: string;
}
