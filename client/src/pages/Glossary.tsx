import React, { useState, useEffect } from "react";
import { Library, Search, Trash2, Sparkles, Loader2, BookOpen } from "lucide-react";
import { api, CourseTag, Reading, GlossaryEntry } from "../api/client";

const COURSES: CourseTag[] = [
  "Contracts", "Torts", "Civil Procedure", "Criminal Law", "Property", "Constitutional Law", "Other",
];

export function Glossary() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [entries, setEntries] = useState<GlossaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Extract form
  const [selectedReadingId, setSelectedReadingId] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");

  // Filter state
  const [search, setSearch] = useState("");
  const [filterCourse, setFilterCourse] = useState<CourseTag | "All">("All");

  useEffect(() => {
    Promise.all([api.readings.list(), api.glossary.list()])
      .then(([r, g]) => { setReadings(r); setEntries(g); })
      .finally(() => setLoading(false));
  }, []);

  async function handleExtract() {
    if (!selectedReadingId) { setExtractError("Select a reading first."); return; }
    setExtractError("");
    setExtracting(true);
    try {
      const newEntries = await api.glossary.extract(selectedReadingId);
      setEntries((prev) => {
        const existing = new Set(prev.map((e) => e.id));
        return [...prev, ...newEntries.filter((e) => !existing.has(e.id))];
      });
      setSelectedReadingId("");
    } catch (err: unknown) {
      setExtractError((err as Error).message ?? "Failed to extract terms");
    } finally {
      setExtracting(false);
    }
  }

  async function handleDelete(id: string) {
    await api.glossary.delete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const filtered = entries.filter((e) => {
    const matchSearch = !search
      || e.term.toLowerCase().includes(search.toLowerCase())
      || e.definition.toLowerCase().includes(search.toLowerCase());
    const matchCourse = filterCourse === "All" || e.course === filterCourse;
    return matchSearch && matchCourse;
  });

  const courseColor: Record<CourseTag, string> = {
    "Contracts": "text-blue-300 bg-blue-900/30 border-blue-800/50",
    "Torts": "text-orange-300 bg-orange-900/30 border-orange-800/50",
    "Civil Procedure": "text-purple-300 bg-purple-900/30 border-purple-800/50",
    "Criminal Law": "text-red-300 bg-red-900/30 border-red-800/50",
    "Property": "text-emerald-300 bg-emerald-900/30 border-emerald-800/50",
    "Constitutional Law": "text-yellow-300 bg-yellow-900/30 border-yellow-800/50",
    "Other": "text-gray-300 bg-gray-800 border-gray-700",
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-900/30 border border-teal-800/50 rounded-xl">
            <Library className="text-teal-400" size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-100">Legal Glossary</h1>
            <p className="text-sm text-gray-400">
              {entries.length} terms saved
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Left: extract panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 sticky top-6">
            <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Sparkles size={14} className="text-teal-400" />
              Extract Terms
            </h2>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Select Reading</label>
              {loading ? (
                <p className="text-xs text-gray-600">Loading...</p>
              ) : (
                <select
                  value={selectedReadingId}
                  onChange={(e) => { setSelectedReadingId(e.target.value); setExtractError(""); }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="">Select a reading...</option>
                  {readings.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              )}
            </div>

            {extractError && <p className="text-red-400 text-xs">{extractError}</p>}

            <button
              onClick={handleExtract}
              disabled={extracting || !selectedReadingId}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-teal-700 hover:bg-teal-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all"
            >
              {extracting ? (
                <><Loader2 size={14} className="animate-spin" /> Extracting...</>
              ) : (
                <><BookOpen size={14} /> Extract Terms</>
              )}
            </button>
          </div>
        </div>

        {/* Right: glossary */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search + filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search terms or definitions..."
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-gray-100 text-sm placeholder-gray-600 focus:outline-none focus:border-teal-500"
              />
            </div>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value as CourseTag | "All")}
              className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-teal-500"
            >
              <option value="All">All Courses</option>
              {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Entry count */}
          {search || filterCourse !== "All" ? (
            <p className="text-xs text-gray-600">{filtered.length} matching terms</p>
          ) : null}

          {/* Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-teal-500 animate-spin" size={24} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
              <Library className="mx-auto text-gray-700 mb-3" size={32} />
              <p className="text-sm text-gray-500">
                {entries.length === 0
                  ? "No terms yet. Extract terms from a reading to get started."
                  : "No terms match your search."}
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4 group hover:border-gray-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-100 text-sm">{entry.term}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${courseColor[entry.course]}`}>
                        {entry.course}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-2 shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed mb-2">{entry.definition}</p>
                  {entry.example && (
                    <p className="text-xs text-gray-500 italic border-t border-gray-800 pt-2">
                      Ex: {entry.example}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
