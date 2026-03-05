import React, { useEffect, useState, useRef } from "react";
import { api, Reading, CourseTag } from "../api/client";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Modal } from "../components/ui/Modal";
import { Plus, Trash2, Eye, Upload, BookOpen } from "lucide-react";

const COURSES: CourseTag[] = [
  "Contracts","Torts","Civil Procedure","Criminal Law","Property","Constitutional Law","Other",
];

export function Readings() {
  const [readings, setReadings]       = useState<Reading[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [showAdd, setShowAdd]         = useState(false);
  const [selected, setSelected]       = useState<Reading | null>(null);
  const [loadingSelected, setLS]      = useState(false);
  const [deleting, setDeleting]       = useState<string | null>(null);
  const [title, setTitle]             = useState("");
  const [course, setCourse]           = useState<CourseTag>("Contracts");
  const [content, setContent]         = useState("");
  const [saving, setSaving]           = useState(false);
  const [formError, setFormError]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      setLoading(true);
      setReadings(await api.readings.list());
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setContent(ev.target?.result as string ?? "");
    reader.readAsText(file);
    if (!title) setTitle(file.name.replace(/\.(txt|md)$/, ""));
  };

  const handleAdd = async () => {
    setFormError("");
    if (!title.trim()) return setFormError("Title is required.");
    if (!content.trim()) return setFormError("Content is required.");
    try {
      setSaving(true);
      const r = await api.readings.create({ title: title.trim(), course, content: content.trim() });
      setReadings((prev) => [r, ...prev]);
      setShowAdd(false);
      setTitle(""); setCourse("Contracts"); setContent("");
    } catch (e: unknown) {
      setFormError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Fetch FULL reading (with content) when user clicks View
  const handleView = async (r: Reading) => {
    try {
      setLS(true);
      const full = await api.readings.get(r.id);
      setSelected(full);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLS(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleting(id);
      await api.readings.delete(id);
      setReadings((prev) => prev.filter((r) => r.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <BookOpen className="text-law-400" size={26} /> Readings
          </h1>
          <p className="text-gray-400 text-sm mt-1">Paste or upload case excerpts and readings</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus size={16} /> Add Reading</Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Spinner label="Loading readings..." /></div>
      ) : readings.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>No readings yet. Add your first case.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {readings.map((r) => (
            <Card key={r.id} className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge label={r.course} variant="course" />
                  {r.briefId && <Badge label="Briefed" variant="success" />}
                </div>
                <h2 className="font-semibold text-gray-100 truncate">{r.title}</h2>
                <p className="text-xs text-gray-500 mt-1">{new Date(r.dateAdded).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" loading={loadingSelected} onClick={() => handleView(r)}>
                  <Eye size={15} /> View
                </Button>
                <Button
                  variant="ghost" size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  loading={deleting === r.id}
                  onClick={() => handleDelete(r.id)}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Reading Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setFormError(""); }} title="Add Reading" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
            <input
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-law-500"
              placeholder="e.g. Palsgraf v. Long Island Railroad Co."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Course</label>
            <select
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-law-500"
              value={course}
              onChange={(e) => setCourse(e.target.value as CourseTag)}
            >
              {COURSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-300">Content</label>
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 text-xs text-law-400 hover:text-law-300">
                <Upload size={13} /> Upload .txt / .md
              </button>
              <input ref={fileRef} type="file" accept=".txt,.md" className="hidden" onChange={handleFile} />
            </div>
            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-law-500 resize-none font-mono"
              rows={12}
              placeholder="Paste case text here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          {formError && <p className="text-sm text-red-400">{formError}</p>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleAdd}>Save Reading</Button>
          </div>
        </div>
      </Modal>

      {/* View Reading Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title} size="xl">
        {selected && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge label={selected.course} variant="course" />
              <span className="text-xs text-gray-500">Added {new Date(selected.dateAdded).toLocaleDateString()}</span>
            </div>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-auto max-h-[60vh] whitespace-pre-wrap font-mono leading-relaxed">
              {selected.content}
            </pre>
          </div>
        )}
      </Modal>
    </div>
  );
}
