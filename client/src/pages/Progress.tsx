import React, { useEffect, useState } from "react";
import { api, DrillAttempt } from "../api/client";
import { Spinner } from "../components/ui/Spinner";
import { Card } from "../components/ui/Card";
import { BarChart2, TrendingUp, Target, CreditCard, BookOpen } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";

export function Progress() {
  const [attempts, setAttempts]       = useState<DrillAttempt[]>([]);
  const [loading, setLoading]         = useState(true);
  const [deckCount, setDeckCount]     = useState(0);
  const [readingCount, setReadingCount] = useState(0);
  const [briefCount, setBriefCount]   = useState(0);

  useEffect(() => {
    Promise.all([
      api.issueSpotter.history(),
      api.flashcards.listDecks(),
      api.readings.list(),
      api.brief.list(),
    ]).then(([a, d, r, b]) => {
      setAttempts(a);
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

  const avgScore = avg(attempts.map((a) => a.score.total));

  const trendData = [...attempts].slice(-10).map((a, i) => ({
    attempt: i + 1,
    score: a.score.total,
    date: new Date(a.dateAttempted).toLocaleDateString(),
  }));

  const byCourse: Record<string, number[]> = {};
  for (const a of attempts) {
    if (!byCourse[a.course]) byCourse[a.course] = [];
    byCourse[a.course].push(a.score.total);
  }
  const courseData = Object.entries(byCourse).map(([course, scores]) => ({
    course: course.length > 12 ? course.slice(0, 10) + "…" : course,
    avg: avg(scores),
    attempts: scores.length,
  }));

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
    active?: boolean; payload?: { value: number }[]; label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs">
          <p className="text-gray-400">{label}</p>
          <p className="text-law-300 font-bold">{payload[0].value}</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Target}
          label="Drill Attempts"
          value={attempts.length}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Drill Score"
          value={attempts.length ? `${avgScore}%` : "—"}
          sub={attempts.length > 0 ? `${attempts.length} attempts` : undefined}
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

      {attempts.length === 0 ? (
        <div className="text-center py-20 text-gray-500 border border-dashed border-gray-800 rounded-xl">
          <Target size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">
            No drill attempts yet. Head to{" "}
            <span className="text-law-400">Drills</span> to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Row 1: trend + course breakdown */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Score Trend */}
            <Card>
              <h2 className="text-sm font-semibold text-gray-300 mb-4">
                Score Trend (last 10 drills)
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
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ fill: "#8b5cf6", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#a78bfa" }}
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
                    <Bar dataKey="avg" fill="#7c3aed" radius={[4, 4, 0, 0]} />
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