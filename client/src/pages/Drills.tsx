import React, { useState, useEffect, useRef } from "react";
import { api, CourseTag, Difficulty, GradeResult, DrillAttempt } from "../api/client";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Card } from "../components/ui/Card";
import { Target, Clock, ChevronRight, RotateCcw, CheckCircle } from "lucide-react";

const COURSES: CourseTag[] = [
  "Contracts","Torts","Civil Procedure","Criminal Law","Property","Constitutional Law","Other",
];

type Phase = "configure" | "writing" | "results";

export function Drills() {
  const [phase, setPhase]           = useState<Phase>("configure");
  const [course, setCourse]         = useState<CourseTag>("Torts");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [hypo, setHypo]             = useState("");
  const [issueCount, setIssueCount] = useState(0);
  const [recommended, setRecommended] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [result, setResult]         = useState<GradeResult | null>(null);
  const [history, setHistory]       = useState<DrillAttempt[]>([]);
  const [generating, setGenerating] = useState(false);
  const [grading, setGrading]       = useState(false);
  const [loadingHistory, setLH]     = useState(true);
  const [error, setError]           = useState("");
  const [showFullOutline, setShowFull] = useState(false);

  // Timer
  const [elapsed, setElapsed]       = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.issueSpotter.history().then(setHistory).finally(() => setLH(false));
  }, []);

  useEffect(() => {
    if (phase === "writing") {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError("");
      const data = await api.issueSpotter.generate(course, difficulty);
      setHypo(data.hypothetical);
      setIssueCount(data.issueCount);
      setRecommended(data.timeRecommendedMinutes);
      setUserAnswer("");
      setResult(null);
      setPhase("writing");
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handleGrade = async () => {
    if (!userAnswer.trim()) return;
    try {
      setGrading(true);
      setError("");
      const res = await api.issueSpotter.grade({
        course, difficulty, prompt: hypo,
        userAnswer, timeSpentSeconds: elapsed,
      });
      setResult(res);
      setHistory((prev) => [{
        id: res.attemptId,
        course, difficulty, prompt: hypo,
        userAnswer, score: res.score,
        modelOutline: res.modelOutline,
        suggestions: res.suggestions,
        dateAttempted: new Date().toISOString(),
        timeSpentSeconds: elapsed,
      }, ...prev]);
      setPhase("results");
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setGrading(false);
    }
  };

  const ScoreBar = ({ label, value }: { label: string; value: number }) => (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="font-semibold text-gray-200">{value}/25</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            value >= 20 ? "bg-green-500" : value >= 13 ? "bg-yellow-500" : "bg-red-500"
          }`}
          style={{ width: `${(value / 25) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Target className="text-law-400" size={26} /> Issue Spotting Drills
        </h1>
        <p className="text-gray-400 text-sm mt-1">Practice identifying legal issues under exam conditions</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      {/* Configure */}
      {phase === "configure" && (
        <div className="space-y-8">
          <Card>
            <h2 className="text-base font-semibold text-gray-100 mb-5">Configure Drill</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Course</label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-law-500"
                  value={course}
                  onChange={(e) => setCourse(e.target.value as CourseTag)}
                >
                  {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {(["easy","medium","hard"] as Difficulty[]).map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                        difficulty === d
                          ? d === "easy" ? "bg-green-900/50 border-green-700 text-green-300"
                          : d === "medium" ? "bg-yellow-900/50 border-yellow-700 text-yellow-300"
                          : "bg-red-900/50 border-red-700 text-red-300"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button loading={generating} onClick={handleGenerate} size="lg">
                <Target size={16} /> Generate Hypothetical
              </Button>
            </div>
          </Card>

          {/* History */}
          {!loadingHistory && history.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Recent Attempts
              </h2>
              <div className="space-y-2">
                {history.slice(0, 5).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge label={a.course} variant="course" />
                      <Badge
                        label={a.difficulty}
                        variant={a.difficulty === "easy" ? "success" : a.difficulty === "medium" ? "warning" : "danger"}
                      />
                      <span className="text-xs text-gray-500">
                        {new Date(a.dateAttempted).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${
                        a.score.total >= 75 ? "text-green-400"
                        : a.score.total >= 50 ? "text-yellow-400" : "text-red-400"
                      }`}>
                        {a.score.total}/100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Writing Phase */}
      {phase === "writing" && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge label={course} variant="course" />
              <Badge
                label={difficulty}
                variant={difficulty === "easy" ? "success" : difficulty === "medium" ? "warning" : "danger"}
              />
              <span className="text-sm text-gray-400">
                ~{issueCount} issues expected
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 text-sm font-mono font-medium ${
                recommended > 0 && elapsed > recommended * 60 ? "text-red-400" : "text-gray-300"
              }`}>
                <Clock size={15} /> {formatTime(elapsed)}
                {recommended > 0 && (
                  <span className="text-gray-500 font-normal">/ {recommended}:00 rec.</span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setPhase("configure")}>
                ← Back
              </Button>
            </div>
          </div>

          {/* Hypothetical */}
          <Card>
            <h3 className="text-xs font-semibold text-law-400 uppercase tracking-wide mb-3">
              Hypothetical
            </h3>
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{hypo}</p>
          </Card>

          {/* Answer */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Your Answer <span className="text-gray-500 font-normal">(identify all issues, apply rules)</span>
            </label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-law-500 resize-none"
              rows={16}
              placeholder="Spot all legal issues. For each issue: identify it, state the applicable rule, and briefly apply the rule to the facts..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">{userAnswer.split(/\s+/).filter(Boolean).length} words</p>
          </div>

          <div className="flex justify-end">
            <Button
              size="lg"
              loading={grading}
              disabled={!userAnswer.trim()}
              onClick={handleGrade}
            >
              <CheckCircle size={16} /> Submit for Grading
            </Button>
          </div>
        </div>
      )}

      {/* Results Phase */}
      {phase === "results" && result && (
        <div className="space-y-6">
          {/* Score Summary */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-100">Results</h2>
              <div className={`text-3xl font-black ${
                result.score.total >= 75 ? "text-green-400"
                : result.score.total >= 50 ? "text-yellow-400" : "text-red-400"
              }`}>
                {result.score.total}<span className="text-lg text-gray-500">/100</span>
              </div>
            </div>
            <div className="space-y-3">
              <ScoreBar label="Issue Identification" value={result.score.issueIdentification} />
              <ScoreBar label="Rule Accuracy"        value={result.score.ruleAccuracy} />
              <ScoreBar label="Application Quality"  value={result.score.applicationQuality} />
              <ScoreBar label="Organization & Clarity" value={result.score.organizationClarity} />
            </div>
          </Card>

          {/* Feedback */}
          {result.feedback && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Detailed Feedback</h3>
              <div className="space-y-3">
                {Object.entries(result.feedback).map(([key, val]) => (
                  <div key={key}>
                    <p className="text-xs text-law-400 font-semibold uppercase tracking-wide">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </p>
                    <p className="text-sm text-gray-300 mt-0.5 leading-relaxed">{val}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Suggestions */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">
              3 Concrete Improvements
            </h3>
            <ol className="space-y-2">
              {result.suggestions.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-300">
                  <span className="text-law-400 font-bold shrink-0">{i + 1}.</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </Card>

          {/* Model Outline */}
          <Card>
            <button
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-300"
              onClick={() => setShowFull((v) => !v)}
            >
              <span>Model Answer Outline</span>
              {showFullOutline ? <ChevronRight size={16} /> : <ChevronRight size={16} className="rotate-90" />}
            </button>
            {showFullOutline && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {result.modelOutline}
                </p>
              </div>
            )}
          </Card>

          <div className="flex gap-3">
            <Button onClick={() => { setPhase("configure"); setResult(null); }}>
              <RotateCcw size={15} /> New Drill
            </Button>
            <Button
              variant="secondary"
              onClick={() => { setPhase("writing"); setUserAnswer(""); setResult(null); }}
            >
              Retry Same Hypo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}