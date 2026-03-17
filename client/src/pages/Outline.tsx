import React, { useState, useEffect } from "react";
import { BookMarked, ChevronRight, ChevronDown, Trash2, Copy, Check, Loader2, Plus } from "lucide-react";
import { api, CourseTag, Reading, CourseOutline } from "../api/client";

const COURSES: CourseTag[] = [
  "Contracts", "Torts", "Civil Procedure", "Criminal Law", "Property", "Constitutional Law", "Other",
];

export function Outline() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [outlines, setOutlines] = useState<CourseOutline[]>([]);
  const [loadingReadings, setLoadingReadings] = useState(true);

  // Generate form
  const [course, setCourse] = useState<CourseTag>("Torts");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  // View state
  const [activeOutline, setActiveOutline] = useState<CourseOutline | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<number>>(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([api.readings.list(), api.outline.list()])
      .then(([r, o]) => { setReadings(r); setOutlines(o); })
      .finally(() => setLoadingReadings(false));
  }, []);

  const filteredReadings = readings.filter((r) => r.course === course);

  function toggleReading(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleGenerate() {
    if (selectedIds.length === 0) { setGenError("Select at least one reading."); return; }
    setGenError("");
    setGenerating(true);
    try {
      const outline = await api.outline.generate({
        course,
        readingIds: selectedIds,
        title: title.trim() || undefined,
      });
      setOutlines((prev) => [outline, ...prev]);
      setActiveOutline(outline);
      setExpandedTopics(new Set([0]));
      setSelectedIds([]);
      setTitle("");
    } catch (err: unknown) {
      setGenError((err as Error).message ?? "Failed to generate outline");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(id: string) {
    await api.outline.delete(id);
    setOutlines((prev) => prev.filter((o) => o.id !== id));
    if (activeOutline?.id === id) setActiveOutline(null);
  }

  function copyOutline(outline: CourseOutline) {
    const lines: string[] = [`# ${outline.title}\n`];
    for (const topic of outline.topics) {
      lines.push(`## ${topic.title}`);
      for (const sub of topic.subtopics) {
        lines.push(`\n### ${sub.title}`);
        lines.push(`**Rule:** ${sub.rule}`);
        if (sub.cases.length > 0) {
          lines.push("\n**Cases:**");
          sub.cases.forEach((c) => lines.push(`- ${c}`));
        }
        if (sub.notes) lines.push(`\n*${sub.notes}*`);
      }
      lines.push("");
    }
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleTopic(i: number) {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-cyan-900/30 border border-cyan-800/50 rounded-xl">
          <BookMarked className="text-cyan-400" size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-100">Outline Builder</h1>
          <p className="text-sm text-gray-400">Generate hierarchical course outlines from your readings</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: generate form + outline list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300">Generate New Outline</h2>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Course</label>
              <select
                value={course}
                onChange={(e) => { setCourse(e.target.value as CourseTag); setSelectedIds([]); }}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-cyan-500"
              >
                {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Title (optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`${course} Outline`}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-gray-100 text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Select Readings ({selectedIds.length} selected)
              </label>
              {loadingReadings ? (
                <p className="text-xs text-gray-600">Loading...</p>
              ) : filteredReadings.length === 0 ? (
                <p className="text-xs text-gray-600">No {course} readings. Add some first.</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filteredReadings.map((r) => (
                    <label
                      key={r.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={() => toggleReading(r.id)}
                        className="accent-cyan-500"
                      />
                      <span className="text-xs text-gray-300 truncate">{r.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {genError && <p className="text-red-400 text-xs">{genError}</p>}

            <button
              onClick={handleGenerate}
              disabled={generating || selectedIds.length === 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all"
            >
              {generating ? (
                <><Loader2 size={14} className="animate-spin" /> Generating...</>
              ) : (
                <><Plus size={14} /> Generate Outline</>
              )}
            </button>
          </div>

          {/* Saved outlines */}
          {outlines.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Saved Outlines
              </h2>
              <div className="space-y-1">
                {outlines.map((o) => (
                  <div
                    key={o.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                      activeOutline?.id === o.id
                        ? "bg-cyan-900/30 border border-cyan-800/50"
                        : "hover:bg-gray-800"
                    }`}
                    onClick={() => { setActiveOutline(o); setExpandedTopics(new Set([0])); }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 truncate">{o.title}</p>
                      <p className="text-xs text-gray-500">{o.course} · {o.topics.length} topics</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(o.id); }}
                      className="text-gray-600 hover:text-red-400 transition-colors ml-2 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: outline view */}
        <div className="lg:col-span-3">
          {!activeOutline ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              <BookMarked className="mx-auto text-gray-700 mb-3" size={32} />
              <p className="text-sm text-gray-500">Generate or select an outline to view it here</p>
            </div>
          ) : (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              {/* Outline header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
                <div>
                  <h2 className="font-bold text-gray-100">{activeOutline.title}</h2>
                  <p className="text-xs text-gray-500">{activeOutline.course} · {activeOutline.topics.length} topics</p>
                </div>
                <button
                  onClick={() => copyOutline(activeOutline)}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>

              {/* Topics */}
              <div className="divide-y divide-gray-800/50">
                {activeOutline.topics.map((topic, ti) => (
                  <div key={ti}>
                    <button
                      onClick={() => toggleTopic(ti)}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-800/50 transition-all text-left"
                    >
                      <span className="font-semibold text-gray-100 text-sm">{topic.title}</span>
                      {expandedTopics.has(ti) ? (
                        <ChevronDown size={15} className="text-gray-500" />
                      ) : (
                        <ChevronRight size={15} className="text-gray-500" />
                      )}
                    </button>

                    {expandedTopics.has(ti) && (
                      <div className="px-5 pb-4 space-y-4">
                        {topic.subtopics.map((sub, si) => (
                          <div key={si} className="border-l-2 border-cyan-800/50 pl-4 py-1">
                            <h4 className="font-semibold text-cyan-300 text-sm mb-1">{sub.title}</h4>
                            <p className="text-sm text-gray-300 leading-relaxed mb-2">
                              <span className="text-gray-500 text-xs font-medium uppercase mr-1">Rule:</span>
                              {sub.rule}
                            </p>
                            {sub.cases.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Cases</p>
                                <ul className="space-y-1">
                                  {sub.cases.map((c, ci) => (
                                    <li key={ci} className="text-xs text-gray-400 flex gap-2">
                                      <span className="text-cyan-600 mt-0.5">•</span>
                                      {c}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {sub.notes && (
                              <p className="text-xs text-gray-500 italic">{sub.notes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
