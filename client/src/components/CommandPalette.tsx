import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, BookOpen, FileText, CreditCard, Library, BookMarked, CornerDownLeft,
} from "lucide-react";
import { api } from "../api/client";

interface PaletteItem {
  id: string;
  type: "Reading" | "Brief" | "Deck" | "Glossary" | "Outline";
  label: string;
  sublabel: string;
  to: string;
}

const TYPE_ICON: Record<PaletteItem["type"], React.ElementType> = {
  Reading: BookOpen,
  Brief: FileText,
  Deck: CreditCard,
  Glossary: Library,
  Outline: BookMarked,
};

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PaletteItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || loaded) return;
    Promise.all([
      api.readings.list(),
      api.brief.list(),
      api.flashcards.listDecks(),
      api.glossary.list(),
      api.outline.list(),
    ]).then(([readings, briefs, decks, glossary, outlines]) => {
      setItems([
        ...readings.map((r) => ({
          id: r.id, type: "Reading" as const, label: r.title, sublabel: r.course, to: "/readings",
        })),
        ...briefs.map((b) => ({
          id: b.id, type: "Brief" as const, label: b.title, sublabel: b.course, to: "/briefs",
        })),
        ...decks.map((d) => ({
          id: d.id, type: "Deck" as const, label: d.name, sublabel: `${d.course} · ${d.cardCount} cards`, to: "/flashcards",
        })),
        ...glossary.map((g) => ({
          id: g.id, type: "Glossary" as const, label: g.term, sublabel: g.course, to: "/glossary",
        })),
        ...outlines.map((o) => ({
          id: o.id, type: "Outline" as const, label: o.title, sublabel: `${o.course} · ${o.topics.length} topics`, to: "/outline",
        })),
      ]);
      setLoaded(true);
    });
  }, [open, loaded]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 8);
    return items
      .filter((i) => i.label.toLowerCase().includes(q) || i.sublabel.toLowerCase().includes(q))
      .slice(0, 8);
  }, [items, query]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  function go(item: PaletteItem) {
    navigate(item.to);
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && filtered[activeIndex]) { go(filtered[activeIndex]); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
          <Search size={17} className="text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search readings, briefs, decks, glossary, outlines..."
            className="flex-1 bg-transparent text-gray-100 text-sm placeholder-gray-600 focus:outline-none"
          />
          <kbd className="text-[10px] text-gray-600 border border-gray-700 rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {!loaded ? (
            <p className="px-4 py-6 text-sm text-gray-600 text-center">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-600 text-center">
              {items.length === 0 ? "Nothing to search yet." : "No matches."}
            </p>
          ) : (
            <div className="py-2">
              {filtered.map((item, i) => {
                const Icon = TYPE_ICON[item.type];
                return (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => go(item)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      i === activeIndex ? "bg-law-700/20" : "hover:bg-gray-800/60"
                    }`}
                  >
                    <Icon size={15} className="text-law-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-100 truncate">{item.label}</p>
                      <p className="text-xs text-gray-500 truncate">{item.type} · {item.sublabel}</p>
                    </div>
                    {i === activeIndex && <CornerDownLeft size={13} className="text-gray-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
