import React from "react";

export function Spinner({ size = "md", label }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const s = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" }[size];
  return (
    <div className="flex flex-col items-center gap-3">
      <svg className={`animate-spin ${s} text-law-500`} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  );
}
