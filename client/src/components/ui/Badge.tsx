import React from "react";

const COURSE_COLORS: Record<string, string> = {
  Contracts:            "bg-blue-900/50 text-blue-300 border-blue-800",
  Torts:                "bg-red-900/50 text-red-300 border-red-800",
  "Civil Procedure":    "bg-yellow-900/50 text-yellow-300 border-yellow-800",
  "Criminal Law":       "bg-orange-900/50 text-orange-300 border-orange-800",
  Property:             "bg-green-900/50 text-green-300 border-green-800",
  "Constitutional Law": "bg-purple-900/50 text-purple-300 border-purple-800",
  Other:                "bg-gray-800 text-gray-300 border-gray-700",
};

interface BadgeProps {
  label: string;
  variant?: "course" | "default" | "success" | "warning" | "danger";
}

export function Badge({ label, variant = "default" }: BadgeProps) {
  if (variant === "course") {
    const color = COURSE_COLORS[label] ?? COURSE_COLORS["Other"];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${color}`}>
        {label}
      </span>
    );
  }
  const colors = {
    default: "bg-gray-800 text-gray-300 border-gray-700",
    success: "bg-green-900/50 text-green-300 border-green-800",
    warning: "bg-yellow-900/50 text-yellow-300 border-yellow-800",
    danger:  "bg-red-900/50 text-red-300 border-red-800",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${colors[variant]}`}>
      {label}
    </span>
  );
}
