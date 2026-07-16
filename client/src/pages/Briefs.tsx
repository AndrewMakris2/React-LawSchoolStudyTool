import React, { useEffect, useRef, useState } from "react";
import { api, CaseBrief, IracBrief, Reading, PolishStyle, GlossaryEntry, CourseTag } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { FileText, Wand2, Save, ClipboardList, PenLine, Upload } from "lucide-react";
import { PrintButton } from "../components/PrintButton";
import { GlossaryText } from "../components/GlossaryText";

const GLOSSARY_LINKED_FIELDS = new Set(["rule", "reasoning", "holding"]);

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

const IRAC_FIELDS: { key: keyof IracBrief; label: string }[] = [
  { key: "issue",       label: "Issue" },
  { key: "rule",        label: "Rule" },
  { key: "application", label: "Application" },
  { key: "conclusion",  label: "Conclusion" },
];

const COURSES: CourseTag[] = [
  "Contracts", "Torts", "Civil Procedure", "Criminal Law", "Property", "Constitutional Law", "Other",
];

const POLISH_STYLES: PolishStyle[] = ["concise", "standard", "verbose"];

type Format = "traditional" | "irac";

export function Briefs() {
  const [format, setFormat] = useState<Format>("traditional");

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
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryEntry[]>([]);

  // IRAC state
  const [iracBriefs, setIracBriefs]         = useState<IracBrief[]>([]);
  const [selectedIrac, setSelectedIrac]     = useState<IracBrief | null>(null);
  const [editingIrac, setEditingIrac]       = useState<Partial<IracBrief>>({});
  const [savingIrac, setSavingIrac]         = useState(false);
  const [saveSuccessIrac, setSaveSuccessIrac] = useState(false);
  const [generatingIracReadingId, setGeneratingIracReadingId] = useState<string | null>(null);
  const [pasteTitle, setPasteTitle]   = useState("");
  const [pasteCourse, setPasteCourse] = useState<CourseTag>("Contracts");
  const [pasteText, setPasteText]     = useState("");
  const [generatingPaste, setGeneratingPaste] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPasteText(ev.target?.result as string ?? "");
    reader.readAsText(file);
    if (!pasteTitle) setPasteTitle(file.name.replace(/\.(txt|md)$/, ""));
    e.target.value = "";
  };

  const load = async () => {
    try {
      setLoading(true);
      const [b, r, ib] = await Promise.all([api.brief.list(), api.readings.list(), api.iracBrief.list()]);
      setBriefs(b);
      setReadings(r);
      setIracBriefs(ib);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { api.glossary.list().then(setGlossaryTerms); }, []);

  const openBrief = (brief: CaseBrief) => {
    setSelected(brief);
    setEditing({ ...brief });
    setPolishedRule("");
    setSaveSuccess(false);
  };

  const openIracBrief = (brief: IracBrief) => {
    setSelectedIrac(brief);
    setEditingIrac({ ...brief });
    setSaveSuccessIrac(false);
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

  const handleGenerateIracFromReading = async (readingId: string) => {
    try {
      setGeneratingIracReadingId(readingId);
      setError("");
      const brief = await api.iracBrief.generateFromReading(readingId);
      setIracBriefs((prev) => [brief, ...prev]);
      openIracBrief(brief);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setGeneratingIracReadingId(null);
    }
  };

  const handleGenerateIracFromText = async () => {
    if (!pasteTitle.trim() || pasteText.trim().length < 20) {
      setError("Give the case a title and paste at least a few sentences of case text.");
      return;
    }
    try {
      setGeneratingPaste(true);
      setError("");
      const brief = await api.iracBrief.generateFromText({
        title: pasteTitle.trim(),
        course: pasteCourse,
        caseText: pasteText.trim(),
      });
      setIracBriefs((prev) => [brief, ...prev]);
      openIracBrief(brief);
      setPasteTitle("");
      setPasteText("");
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setGeneratingPaste(false);
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

  const handleSaveIrac = async () => {
    if (!selectedIrac) return;
    try {
      setSavingIrac(true);
      const updated = await api.iracBrief.update(selectedIrac.id, editingIrac);
      setIracBriefs((prev) => prev.map((b) => b.id === updated.id ? updated : b));
      setSelectedIrac(updated);
      setEditingIrac({ ...updated });
      setSaveSuccessIrac(true);
      setTimeout(() => setSaveSuccessIrac(false), 2000);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSavingIrac(false);
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

  // Readings without traditional briefs
  const unbriefed = readings.filter((r) => !r.briefId);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <FileText className="text-law-400" size={26} /> Case Briefs
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            AI-generated briefs you can edit and refine
          </p>
        </div>

        {/* Format toggle */}
        <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
          <button
            onClick={() => { setFormat("traditional"); setError(""); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              format === "traditional"
                ? "bg-law-700 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <FileText size={13} /> Traditional
          </button>
          <button
            onClick={() => { setFormat("irac"); setError(""); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              format === "irac"
                ? "bg-law-700 text-white"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <ClipboardList size={13} /> IRAC
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner label="Loading briefs..." /></div>
      ) : format === "traditional" ? (
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
              <div className="no-print bg-gray-900 border border-gray-800 rounded-xl p-5 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-100">{selected.title}</h2>
                    <Badge label={selected.course} variant="course" />
                  </div>
                  <div className="flex items-center gap-2">
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
                    <PrintButton />
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
                  {FIELDS.map(({ key, label }) => {
                    const courseTerms = glossaryTerms.filter((g) => g.course === selected.course);
                    const fieldValue = (editing[key] as string) ?? "";
                    return (
                      <div key={key}>
                        <label className="block text-xs font-semibold text-law-400 uppercase tracking-wide mb-1">
                          {label}
                        </label>
                        <textarea
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-law-500 resize-none"
                          rows={key === "facts" || key === "reasoning" ? 5 : 3}
                          value={fieldValue}
                          onChange={(e) =>
                            setEditing((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                        />
                        {GLOSSARY_LINKED_FIELDS.has(key) && courseTerms.length > 0 && fieldValue && (
                          <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                            <GlossaryText text={fieldValue} terms={courseTerms} />
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                <FileText size={32} className="mb-3 opacity-30" />
                <p className="text-sm">Select a brief to view and edit</p>
              </div>
            )}

            {/* Print-only read view (edit form above is hidden via .no-print) */}
            {selected && (
              <div className="printable-area hidden print:block p-6">
                <h1 className="text-2xl font-bold mb-1">{selected.title}</h1>
                <p className="text-sm mb-6">{selected.course}</p>
                {FIELDS.map(({ key, label }) => (
                  <div key={key} className="mb-4">
                    <h3 className="font-semibold uppercase text-xs tracking-wide mb-1">{label}</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {(editing[key] as string) ?? ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Generate (from reading or pasted text) + saved list */}
          <div className="space-y-6">
            {/* Paste a new case */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                  <PenLine size={14} /> Paste or Upload a Case
                </h2>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs text-law-400 hover:text-law-300"
                >
                  <Upload size={13} /> Upload .txt / .md
                </button>
                <input ref={fileRef} type="file" accept=".txt,.md" className="hidden" onChange={handleFile} />
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Case title (e.g., Smith v. Jones)"
                  value={pasteTitle}
                  onChange={(e) => setPasteTitle(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-law-500"
                />
                <select
                  value={pasteCourse}
                  onChange={(e) => setPasteCourse(e.target.value as CourseTag)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-law-500"
                >
                  {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea
                  placeholder="Paste the case text here, or upload a .txt / .md file above..."
                  rows={6}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-law-500 resize-none"
                />
                <Button
                  size="sm"
                  loading={generatingPaste}
                  onClick={handleGenerateIracFromText}
                  className="w-full justify-center"
                >
                  <Wand2 size={14} /> Generate IRAC Brief
                </Button>
              </div>
            </div>

            {/* Generate from a saved reading */}
            {readings.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Or Generate From a Saved Reading
                </h2>
                <div className="space-y-2">
                  {readings.map((r) => (
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
                        loading={generatingIracReadingId === r.id}
                        onClick={() => handleGenerateIracFromReading(r.id)}
                      >
                        <Wand2 size={14} /> Generate
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved IRAC briefs */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Saved IRAC Briefs
              </h2>
              {iracBriefs.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No IRAC briefs yet. Paste a case or generate one from a reading above.
                </p>
              ) : (
                <div className="space-y-2">
                  {iracBriefs.map((b) => (
                    <Card
                      key={b.id}
                      onClick={() => openIracBrief(b)}
                      className={`transition-all ${
                        selectedIrac?.id === b.id ? "border-law-600" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-100 text-sm">{b.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {b.course && <Badge label={b.course} variant="course" />}
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

          {/* Right: IRAC Editor */}
          <div>
            {selectedIrac ? (
              <div className="no-print bg-gray-900 border border-gray-800 rounded-xl p-5 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-semibold text-gray-100">{selectedIrac.title}</h2>
                    {selectedIrac.course && <Badge label={selectedIrac.course} variant="course" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" loading={savingIrac} onClick={handleSaveIrac}>
                      <Save size={14} />
                      {saveSuccessIrac ? "Saved!" : "Save"}
                    </Button>
                    <PrintButton />
                  </div>
                </div>

                <div className="space-y-4">
                  {IRAC_FIELDS.map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-law-400 uppercase tracking-wide mb-1">
                        {label}
                      </label>
                      <textarea
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-law-500 resize-none"
                        rows={key === "application" ? 6 : 3}
                        value={(editingIrac[key] as string) ?? ""}
                        onChange={(e) =>
                          setEditingIrac((prev) => ({ ...prev, [key]: e.target.value }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 border border-dashed border-gray-800 rounded-xl">
                <ClipboardList size={32} className="mb-3 opacity-30" />
                <p className="text-sm">Select an IRAC brief to view and edit</p>
              </div>
            )}

            {/* Print-only read view */}
            {selectedIrac && (
              <div className="printable-area hidden print:block p-6">
                <h1 className="text-2xl font-bold mb-1">{selectedIrac.title}</h1>
                {selectedIrac.course && <p className="text-sm mb-6">{selectedIrac.course}</p>}
                {IRAC_FIELDS.map(({ key, label }) => (
                  <div key={key} className="mb-4">
                    <h3 className="font-semibold uppercase text-xs tracking-wide mb-1">{label}</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {(editingIrac[key] as string) ?? ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
