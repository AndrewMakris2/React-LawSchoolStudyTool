import React, { useEffect, useMemo, useState } from "react";
import { GlossaryEntry } from "../api/client";

interface GlossaryTextProps {
  text: string;
  terms: GlossaryEntry[];
  className?: string;
}

export function GlossaryText({ text, terms, className }: GlossaryTextProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  useEffect(() => {
    if (!openKey) return;
    const close = () => setOpenKey(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openKey]);

  const { regex, byLower } = useMemo(() => {
    if (terms.length === 0) return { regex: null as RegExp | null, byLower: new Map<string, GlossaryEntry>() };
    const byLowerMap = new Map<string, GlossaryEntry>();
    for (const t of terms) byLowerMap.set(t.term.toLowerCase(), t);
    const sorted = [...terms].sort((a, b) => b.term.length - a.term.length);
    const escaped = sorted.map((t) => t.term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    return { regex: new RegExp(`\\b(${escaped.join("|")})\\b`, "gi"), byLower: byLowerMap };
  }, [terms]);

  if (!regex) return <span className={className}>{text}</span>;

  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const entry = byLower.get(part.toLowerCase());
        if (!entry) return <React.Fragment key={i}>{part}</React.Fragment>;
        const key = `${entry.id}-${i}`;
        return (
          <span key={key} className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpenKey((k) => (k === key ? null : key));
              }}
              className="underline decoration-dotted decoration-law-500 underline-offset-2 text-inherit hover:text-law-300 transition-colors"
            >
              {part}
            </button>
            {openKey === key && (
              <span
                onClick={(e) => e.stopPropagation()}
                className="absolute z-20 left-0 top-full mt-1.5 w-64 bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs text-gray-200 shadow-xl"
              >
                <span className="block font-semibold text-law-300 mb-1">{entry.term}</span>
                <span className="block leading-relaxed">{entry.definition}</span>
                {entry.example && (
                  <span className="block mt-1.5 text-gray-400 italic">{entry.example}</span>
                )}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
