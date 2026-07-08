import React, { useEffect, useState } from "react";
import { api, DrillAttempt, ExamAttempt } from "../api/client";
import { Spinner } from "../components/ui/Spinner";
import { Card } from "../components/ui/Card";
import { BarChart2, TrendingUp, Target, CreditCard, BookOpen, Flame, ClipboardList } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line,
} from "recharts";

function toDayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function computeStreaks(dates: string[]): { current: number; best: number } {
  const daySet = new Set(dates.map(toDayKey));
  const sortedDays = Array.from(daySet).sort();

  let best = 0;
  let run = 0;
  let prevDay: string | null = null;
  for (const day of sortedDays) {
    if (prevDay) {
      const diffDays = Math.round(
        (new Date(day).getTime() - new Date(prevDay).getTime()) / 86400000
      );
      run = diffDays === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prevDay = day;
  }

  const todayKey = toDayKey(new Date().toISOString());
  const cursor = new Date(`${todayKey}T00:00:00.000Z`);
  if (!daySet.has(todayKey)) cursor.setUTCDate(cursor.getUTCDate() - 1);

  let current = 0;
  while (daySet.has(cursor.toISOString().slice(0, 10))) {
    current++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { current, best };
}

function intensityClass(count: number): string {
  if (count === 0) return "bg-gray-800/60";
  if (count === 1) return "bg-law-900";
  if (count === 2) return "bg-law-700";
  return "bg-law-500";
}

export function Progress() {
  const [attempts, setAttempts]       = useState<DrillAttempt[]>([]);
  const [examAttempts, setExamAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading]         = useState(true);
  const [deckCount, setDeckCount]     = useState(0);
  const [readingCount, setReadingCount] = useState(0);
  const [briefCount, setBriefCount]   = useState(0);

  useEffect(() => {
    Promise.all([
      api.issueSpotter.history(),
      api.exam.history(),
      api.flashcards.listDecks(),
      api.readings.list(),
      api.brief.list(),
    ]).then(([a, ex, d, r, b]) => {
      setAttempts(a);
      setExamAttempts(ex);
      setDeckCount(d.length);
      setReadingCount(r.length);
      setBriefCount(b.length);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner label="Loading progress..." />
      </div>
    );
  }

  const avg = (arr: number[]) =>
    arr.length === 0 ? 0 : Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  const examPercent = (e: ExamAttempt) =>
    e.maxScore === 0 ? 0 : Math.round((e.totalScore / e.maxScore) * 100);

  const avgDrillScore = avg(attempts.map((a) => a.score.total));
  const avgExamScore = avg(examAttempts.map(examPercent));
  const avgScore = avg([
    ...attempts.map((a) => a.score.total),
    ...examAttempts.map(examPercent),
  ]);

  type TrendPoint = { date: string; drillScore?: number; examScore?: number };
  const trendData: TrendPoint[] = [
    ...attempts.map((a) => ({ date: a.dateAttempted, drillScore: a.score.total })),
    ...examAttempts.map((e) => ({ date: e.dateAttempted, examScore: examPercent(e) })),
  ]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-10)
    .map((p, i) => ({ ...p, attempt: i + 1, dateLabel: new Date(p.date).toLocaleDateString() }));

  const byCourseDrill: Record<string, number[]> = {};
  for (const a of attempts) {
    if (!byCourseDrill[a.course]) byCourseDrill[a.course] = [];
    byCourseDrill[a.course].push(a.score.total);
  }
  const byCourseExam: Record<string, number[]> = {};
  for (const e of examAttempts) {
    if (!byCourseExam[e.course]) byCourseExam[e.course] = [];
    byCourseExam[e.course].push(examPercent(e));
  }
  const allCourses = Array.from(new Set([...Object.keys(byCourseDrill), ...Object.keys(byCourseExam)]));
  const courseData = allCourses.map((course) => ({
    course: course.length > 12 ? course.slice(0, 10) + "…" : course,
    drillAvg: avg(byCourseDrill[course] ?? []),
    examAvg: avg(byCourseExam[course] ?? []),
  }));

  const activityDates = [
    ...attempts.map((a) => a.dateAttempted),
    ...examAttempts.map((e) => e.dateAttempted),
  ];
  const { current: currentStreak, best: bestStreak } = computeStreaks(activityDates);

  const dayCounts = new Map<string, number>();
  for (const iso of activityDates) {
    const key = toDayKey(iso);
    dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1);
  }
  const todayMid = new Date();
  todayMid.setUTCHours(0, 0, 0, 0);
  const heatmapDays: { date: string; count: number }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(todayMid);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    heatmapDays.push({ date: key, count: dayCounts.get(key) ?? 0 });
  }
  const heatmapCols: { date: string; count: number }[][] = [];
  for (let c = 0; c < 12; c++) heatmapCols.push(heatmapDays.slice(c * 7, c * 7 + 7));

  const hasActivity = attempts.length > 0 || examAttempts.length > 0;

  const subScoreData = attempts.length === 0 ? [] : [
    { category: "Issue ID",    score: avg(attempts.map((a) => a.score.issueIdentification)), max: 25 },
    { category: "Rule",        score: avg(attempts.map((a) => a.score.ruleAccuracy)),        max: 25 },
    { category: "Application", score: avg(attempts.map((a) => a.score.applicationQuality)), max: 25 },
    { category: "Org/Clarity", score: avg(attempts.map((a) => a.score.organizationClarity)), max: 25 },
  ];

  const StatCard = ({
    icon: Icon, label, value, sub,
  }: {
    icon: React.ElementType; label: string; value: string | number; sub?: string;
  }) => (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
          <p className="text-3xl font-black text-gray-100 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <Icon className="text-law-500 opacity-60" size={24} />
      </div>
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs space-y-0.5">
          <p className="text-gray-400">{label}</p>
          {payload.map((p) => (
            <p key={p.name} className="font-bold" style={{ color: p.color }}>
              {p.name}: {p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <BarChart2 className="text-law-400" size={26} /> Progress
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Track your study activity and drill performance
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard
          icon={Flame}
          label="Study Streak"
          value={currentStreak}
          sub={`Best: ${bestStreak} day${bestStreak === 1 ? "" : "s"}`}
        />
        <StatCard
          icon={Target}
          label="Drill Attempts"
          value={attempts.length}
        />
        <StatCard
          icon={ClipboardList}
          label="Exam Attempts"
          value={examAttempts.length}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Score"
          value={hasActivity ? `${avgScore}%` : "—"}
          sub={hasActivity ? `Drills ${avgDrillScore}% · Exams ${examAttempts.length ? `${avgExamScore}%` : "—"}` : undefined}
        />
        <StatCard
          icon={BookOpen}
          label="Readings"
          value={readingCount}
          sub={`${briefCount} briefed`}
        />
        <StatCard
          icon={CreditCard}
          label="Flash Decks"
          value={deckCount}
        />
      </div>

      {/* Activity heatmap */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-300">Activity — Last 12 Weeks</h2>
          <p className="text-xs text-gray-500">{activityDates.length} total activities</p>
        </div>
        <div
          className="grid gap-1 w-fit"
          style={{ gridTemplateRows: "repeat(7, 1fr)", gridAutoFlow: "column" }}
        >
          {heatmapCols.flatMap((col) =>
            col.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} ${day.count === 1 ? "activity" : "activities"}`}
                className={`w-3 h-3 rounded-sm ${intensityClass(day.count)}`}
              />
            ))
          )}
        </div>
      </Card>

      {!hasActivity ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-xl">
          <Target size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            No drill or exam attempts yet. Head to{" "}
            <span className="text-law-400">Drills</span> or{" "}
            <span className="text-law-400">Exams</span> to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: trend + course breakdown */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Score Trend */}
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-4">
                Score Trend (last 10 activities)
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="attempt"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="drillScore"
                    name="Drills"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ fill: "#8b5cf6", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#a78bfa" }}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="examScore"
                    name="Exams"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    dot={{ fill: "#22d3ee", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#67e8f9" }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* By Course */}
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-4">
                Avg Score by Course
              </h2>
              {courseData.length === 0 ? (
                <p className="text-gray-500 text-sm">No data yet.</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={courseData} margin={{ top: 4, right: 8, bottom: 4, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis
                      dataKey="course"
                      tick={{ fill: "#6b7280", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="drillAvg" name="Drills" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="examAvg" name="Exams" fill="#0891b2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Row 2: Sub-score breakdown */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-300 mb-4">
              Average Sub-Score Breakdown (out of 25)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {subScoreData.map(({ category, score }) => (
                <div key={category} className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-2">
                    <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
                      <circle
                        cx="18" cy="18" r="15.9"
                        fill="none"
                        stroke="#1f2937"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18" cy="18" r="15.9"
                        fill="none"
                        stroke={score >= 20 ? "#22c55e" : score >= 13 ? "#eab308" : "#ef4444"}
                        strokeWidth="3"
                        strokeDasharray={`${(score / 25) * 100} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-lg font-black text-gray-100">{score}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 font-medium">{category}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Row 3: Recent attempts table */}
          <Card>
            <h2 className="text-sm font-semibold text-gray-300 mb-4">
              Recent Attempts
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">Date</th>
                    <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">Course</th>
                    <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">Difficulty</th>
                    <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">Issue ID</th>
                    <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">Rule</th>
                    <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">Application</th>
                    <th className="text-left py-2 pr-4 text-xs text-gray-500 font-medium">Org</th>
                    <th className="text-right py-2 text-xs text-gray-500 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {[...attempts].reverse().slice(0, 10).map((a) => (
                    <tr key={a.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="py-2.5 pr-4 text-gray-400 text-xs whitespace-nowrap">
                        {new Date(a.dateAttempted).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="text-xs text-gray-300">{a.course}</span>
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className={`text-xs font-medium ${
                          a.difficulty === "easy" ? "text-green-400"
                          : a.difficulty === "medium" ? "text-yellow-400"
                          : "text-red-400"
                        }`}>
                          {a.difficulty}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-gray-300 text-xs">{a.score.issueIdentification}/25</td>
                      <td className="py-2.5 pr-4 text-gray-300 text-xs">{a.score.ruleAccuracy}/25</td>
                      <td className="py-2.5 pr-4 text-gray-300 text-xs">{a.score.applicationQuality}/25</td>
                      <td className="py-2.5 pr-4 text-gray-300 text-xs">{a.score.organizationClarity}/25</td>
                      <td className="py-2.5 text-right">
                        <span className={`text-sm font-bold ${
                          a.score.total >= 75 ? "text-green-400"
                          : a.score.total >= 50 ? "text-yellow-400"
                          : "text-red-400"
                        }`}>
                          {a.score.total}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}