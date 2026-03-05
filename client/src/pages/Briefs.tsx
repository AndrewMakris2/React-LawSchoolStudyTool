import React, { useEffect, useState } from "react";
import { api, CaseBrief, Reading, PolishStyle } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Modal } from "../components/ui/Modal";
import { FileText, Wand2, Save, ChevronDown, ChevronUp } from "lucide-react";

const FIELDS: { key: keyof CaseBrief; label: string }[] = [
  { key: "facts",             label: "Facts" },
  { key: "proceduralHistory", label: "Procedural History" },
  { key: "issues",            label: "Issue(s)" },
  { key: "holding",           label: "Holding" },
  { key: "rule",              label: "Rule" },
  { key: "reasoning",         label: "Reasoning" },
  { key: "disposition",       label: "Disposition" },
  { key: "notes",             label: "Notes / Policy" },
];

const POLISH_STYLES: PolishStyle[] = ["concise", "standard", "verbose"];

export function Briefs() {
  const [briefs, setBriefs]           = useState<CaseBrief[]>([]);
  const [readings, setReadings]       = useState<Reading[]>([]);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<CaseBrief | null>(null);
  const [editing, setEditing]         = useState<Partial<CaseBrief>>({});
  const [saving, setSaving]           = useState(false);
  const [generating, setGenerating]   = useState<string | null>(null);
  const [polishOpen, setPolishOpen]   = useState(false);
  const [polishStyle, setPolishStyle] = useState<PolishStyle>("standard");
  const [polishedRule, setPolishedRule] = useState("");
  const [polishing, setPolishing]     = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError]             = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const [b, r] = await Promise.all([api.brief.list(), api.readings.list()]);
      setBriefs(b);
      setReadings(r);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openBrief = (brief: CaseBrief) => {
    setSelected(brief);
    setEditing({ ...brief });
    setPolishedRule("");
    setSaveSuccess(false);
  };

  const handleGenerate = async (readingId: string) => {
    try {
      setGenerating(readingId);
      setError("");
      const brief = await api.brief.generate(readingId);
      setBriefs((prev) => {
        const idx = prev.findIndex((b) => b.readingId === readingId);
        if (idx === -1) return [brief, ...prev];
        const updated = [...prev];
        updated[idx] = brief;
        return updated;
      });
      setReadings((prev) =>
        prev.map((r) => r.id === readingId ? { ...r, briefId: brief.id } : r)
      );
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setGenerating(null);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      const updated = await api.brief.update(selected.id, editing);
      setBriefs((prev) => prev.map((b) => b.id === updated.id ? updated : b));
      setSelected(updated);
      setEditing({ ...updated });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handlePolish = async () => {
    const rule = (editing.rule ?? selected?.rule ?? "").trim();
    if (!rule) return;
    try {
      setPolishing(true);
      const { polished } = await api.rulePolish(rule, polishStyle, selected?.course);
      setPolishedRule(polished);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setPolishing(false);
    }
  };

  const applyPolished = () => {
    setEditing((prev) => ({ ...prev, rule: polishedRule }));
    setPolishedRule("");
    setPolishOpen(false);
  };

  // Readings without briefs
  const unbriefed = readings.filter((r) => !r.briefId);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <FileText className="text-law-400" size={26} /> Case Briefs
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          AI-generated briefs you can edit and refine
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner label="Loading briefs..." /></div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Generate + List */}
          <div className="space-y-6">
            {/* Generate from readings */}
            {unbriefed.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Generate Brief
                </h2>
                <div className="space-y-2">
                  {unbriefed.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-200 truncate max-w-[220px]">
                          {r.title}
                        </p>
                        <Badge label={r.course} variant="course" />
                      </div>
                      <Button
                        size="sm"
                        loading={generating === r.id}
                        onClick={() => handleGenerate(r.id)}
                      >
                        <Wand2 size={14} /> Generate
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing briefs */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Saved Briefs
              </h2>
              {briefs.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No briefs yet. Generate one from a reading above.
                </p>
              ) : (
                <div className="space-y-2">
                  {briefs.map((b) => (
                    <Card
                      key={b.id}
                      onClick={() => openBrief(b)}
                      className={`transition-all ${
                        selected?.id === b.id ? "border-law-600" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-100 text-sm">{b.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge label={b.course} variant="course" />
                            <span className="text-xs text-gray-500">
                              {new Date(b.dateModified).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Brief Editor */}
          <div>
            {selected ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-100">{selected.title}</h2>
                    <Badge label={selected.course} variant="course" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setPolishOpen((v) => !v)}
                    >
                      <Wand2 size={14} /> Rule Polisher
                    </Button>
                    <Button size="sm" loading={saving} onClick={handleSave}>
                      <Save size={14} />
                      {saveSuccess ? "Saved!" : "Save"}
                    </Button>
                  </div>
                </div>

                {/* Rule Polisher Panel */}
                {polishOpen && (
                  <div className="mb-5 p-4 bg-gray-800/60 border border-law-800 rounded-xl space-y-3">
                    <p className="text-sm font-semibold text-law-300 flex items-center gap-2">
                      <Wand2 size={14} /> Rule Statement Polisher
                    </p>
                    <div className="flex gap-2">
                      {POLISH_STYLES.map((s) => (
                        <button
                          key={s}
                          onClick={() => setPolishStyle(s)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                            polishStyle === s
                              ? "bg-law-700 border-law-600 text-white"
                              : "bg-gray-800 border-gray-700 text-gray-400 hover:text-gray-200"
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      Will polish: <em className="text-gray-300">"{(editing.rule ?? "").slice(0, 80)}..."</em>
                    </p>
                    <Button size="sm" loading={polishing} onClick={handlePolish}>
                      Polish Rule
                    </Button>
                    {polishedRule && (
                      <div className="mt-2 p-3 bg-law-900/30 border border-law-700 rounded-lg">
                        <p className="text-xs text-law-400 font-semibold mb-1">Polished:</p>
                        <p className="text-sm text-gray-200 leading-relaxed">{polishedRule}</p>
                        <Button size="sm" className="mt-2" onClick={applyPolished}>
                          Apply to Brief
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Fields */}
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {FIELDS.map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-law-400 uppercase tracking-wide mb-1">
                        {label}
                      </label>
                      <textarea
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-law-500 resize-none"
                        rows={key === "facts" || key === "reasoning" ? 5 : 3}
                        value={(editing[key] as string) ?? ""}
                        onChange={(e) =>
                          setEditing((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                <FileText size={32} className="mb-3 opacity-30" />
                <p className="text-sm">Select a brief to view and edit</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}