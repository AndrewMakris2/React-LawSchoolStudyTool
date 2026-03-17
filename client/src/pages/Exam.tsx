import React, { useState, useRef, useEffect } from "react";
import { ClipboardList, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { api, CourseTag, Difficulty, ExamQuestion, ExamQuestionFeedback } from "../api/client";

const COURSES: CourseTag[] = [
  "Contracts", "Torts", "Civil Procedure", "Criminal Law", "Property", "Constitutional Law", "Other",
];

type Phase = "configure" | "taking" | "results";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Exam() {
  const [phase, setPhase] = useState<Phase>("configure");

  // Configure state
  const [course, setCourse] = useState<CourseTag>("Torts");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [questionCount, setQuestionCount] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  // Taking state
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Results state
  const [totalScore, setTotalScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [feedback, setFeedback] = useState<ExamQuestionFeedback[]>([]);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  async function handleGenerate() {
    setGenError("");
    setGenerating(true);
    try {
      const result = await api.exam.generate({ course, difficulty, questionCount });
      setQuestions(result.questions);
      setAnswers({});
      setCurrentIdx(0);
      setElapsed(0);
      setPhase("taking");
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch (err: unknown) {
      setGenError((err as Error).message ?? "Failed to generate exam");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setSubmitError("");
    setSubmitting(true);
    try {
      const result = await api.exam.submit({
        course,
        difficulty,
        questions,
        answers,
        timeSpentSeconds: elapsed,
      });
      setTotalScore(result.totalScore);
      setMaxScore(result.maxScore);
      setFeedback(result.feedback);
      setPhase("results");
    } catch (err: unknown) {
      setSubmitError((err as Error).message ?? "Failed to grade exam");
    } finally {
      setSubmitting(false);
    }
  }

  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const scoreColor = pct >= 75 ? "text-emerald-400" : pct >= 55 ? "text-yellow-400" : "text-red-400";

  // ── Configure ───────────────────────────────────────────────────────────────
  if (phase === "configure") {
    return (
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-violet-900/30 border border-violet-800/50 rounded-xl">
            <ClipboardList className="text-violet-400" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">Practice Exams</h1>
            <p className="text-sm text-gray-400">Mixed MC + essay, AI-graded</p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Course</label>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value as CourseTag)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-gray-100 text-sm focus:outline-none focus:border-violet-500"
            >
              {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 rounded-xl text-sm font-medium capitalize transition-all ${
                    difficulty === d
                      ? "bg-violet-700/50 text-violet-200 border border-violet-600"
                      : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Questions
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`py-2 rounded-xl text-sm font-medium transition-all ${
                    questionCount === n
                      ? "bg-violet-700/50 text-violet-200 border border-violet-600"
                      : "bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600"
                  }`}
                >
                  {n} questions
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              ~{Math.ceil(questionCount * 0.6)} MC + {Math.floor(questionCount * 0.4)} essay
            </p>
          </div>

          {genError && (
            <div className="bg-red-900/20 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">
              {genError}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all"
          >
            {generating ? (
              <><Loader2 size={16} className="animate-spin" /> Generating Exam...</>
            ) : (
              <><ClipboardList size={16} /> Start Exam</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── Taking ──────────────────────────────────────────────────────────────────
  if (phase === "taking") {
    const q = questions[currentIdx];
    const answered = Object.keys(answers).length;

    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-900/30 border border-violet-800/50 rounded-xl">
              <ClipboardList className="text-violet-400" size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-200">{course} — {difficulty}</p>
              <p className="text-xs text-gray-500">{answered}/{questions.length} answered</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5">
            <Clock size={14} />
            <span className="font-mono">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-800 rounded-full mb-6">
          <div
            className="h-full bg-violet-600 rounded-full transition-all"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              q.type === "mc"
                ? "bg-blue-900/30 text-blue-300 border border-blue-800/50"
                : "bg-orange-900/30 text-orange-300 border border-orange-800/50"
            }`}>
              {q.type === "mc" ? "Multiple Choice" : "Essay"} · {q.points} pts
            </span>
          </div>

          <p className="text-gray-100 leading-relaxed mb-5 whitespace-pre-wrap">{q.text}</p>

          {q.type === "mc" && q.options ? (
            <div className="space-y-2">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                    answers[q.id] === opt
                      ? "bg-violet-700/40 text-violet-200 border border-violet-600"
                      : "bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <textarea
              value={answers[q.id] ?? ""}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              placeholder="Write your answer using IRAC structure..."
              rows={8}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-100 text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 resize-none leading-relaxed"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl text-sm hover:border-gray-600 disabled:opacity-40 transition-all"
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {/* Question dots */}
          <div className="flex gap-1.5">
            {questions.map((qx, i) => (
              <button
                key={qx.id}
                onClick={() => setCurrentIdx(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  i === currentIdx
                    ? "bg-violet-500"
                    : answers[qx.id]
                    ? "bg-emerald-600"
                    : "bg-gray-700"
                }`}
              />
            ))}
          </div>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl text-sm hover:border-gray-600 transition-all"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all"
            >
              {submitting ? (
                <><Loader2 size={14} className="animate-spin" /> Grading...</>
              ) : (
                "Submit Exam"
              )}
            </button>
          )}
        </div>

        {submitError && (
          <div className="mt-4 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3 text-red-400 text-sm">
            {submitError}
          </div>
        )}
      </div>
    );
  }

  // ── Results ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Score summary */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-2 bg-violet-900/30 border border-violet-800/50 rounded-xl">
            <ClipboardList className="text-violet-400" size={22} />
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-100 mb-1">Exam Complete</h2>
        <p className="text-sm text-gray-400 mb-5">{course} · {difficulty} · {formatTime(elapsed)}</p>
        <div className={`text-5xl font-black mb-2 ${scoreColor}`}>{pct}%</div>
        <p className="text-sm text-gray-400">
          {totalScore} / {maxScore} points
        </p>
      </div>

      {/* Per-question feedback */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Question Feedback
        </h3>
        {questions.map((q, i) => {
          const fb = feedback.find((f) => f.questionId === q.id);
          const earned = fb?.score ?? 0;
          const isExpanded = expandedQ === q.id;
          const icon = q.type === "mc"
            ? (fb?.correct ? <CheckCircle className="text-emerald-400" size={16} /> : <XCircle className="text-red-400" size={16} />)
            : <AlertCircle className="text-blue-400" size={16} />;

          return (
            <div key={q.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  {icon}
                  <span className="text-sm text-gray-300 font-medium">
                    Q{i + 1} · {q.type === "mc" ? "MC" : "Essay"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold ${
                    earned >= q.points * 0.75 ? "text-emerald-400"
                    : earned >= q.points * 0.5 ? "text-yellow-400"
                    : "text-red-400"
                  }`}>
                    {earned}/{fb?.maxScore ?? q.points}
                  </span>
                  <ChevronRight
                    size={14}
                    className={`text-gray-600 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-3 space-y-3">
                  <p className="text-sm text-gray-300 leading-relaxed">{q.text}</p>
                  {answers[q.id] && (
                    <div className="bg-gray-800 rounded-lg px-3 py-2">
                      <p className="text-xs text-gray-500 mb-1">Your answer:</p>
                      <p className="text-sm text-gray-300">{answers[q.id]}</p>
                    </div>
                  )}
                  {fb?.feedback && (
                    <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg px-3 py-2">
                      <p className="text-xs text-blue-400 mb-1">Feedback:</p>
                      <p className="text-sm text-gray-300 leading-relaxed">{fb.feedback}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          setPhase("configure");
          setQuestions([]);
          setAnswers({});
          setElapsed(0);
          setFeedback([]);
        }}
        className="mt-6 w-full py-3 bg-gray-800 border border-gray-700 text-gray-300 hover:text-gray-100 hover:border-gray-600 rounded-xl text-sm font-medium transition-all"
      >
        Take Another Exam
      </button>
    </div>
  );
}
