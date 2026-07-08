import React from "react";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  onBeforePrint?: () => void;
  label?: string;
}

export function PrintButton({ onBeforePrint, label = "Print" }: PrintButtonProps) {
  function handleClick() {
    onBeforePrint?.();
    setTimeout(() => window.print(), 50);
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
    >
      <Printer size={14} />
      {label}
    </button>
  );
}
