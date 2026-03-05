import React from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen, MessageSquare, FileText,
  Target, CreditCard, BarChart2, Scale,
} from "lucide-react";

const NAV = [
  { to: "/readings",   icon: BookOpen,      label: "Readings"   },
  { to: "/tutor",      icon: MessageSquare, label: "Tutor"      },
  { to: "/briefs",     icon: FileText,      label: "Briefs"     },
  { to: "/drills",     icon: Target,        label: "Drills"     },
  { to: "/flashcards", icon: CreditCard,    label: "Flashcards" },
  { to: "/progress",   icon: BarChart2,     label: "Progress"   },
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <Scale className="text-law-400" size={22} />
          <div>
            <p className="font-bold text-gray-100 text-sm leading-none">LawStudy</p>
            <p className="text-xs text-gray-500 mt-0.5">1L Edition</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-law-700/30 text-law-300 border border-law-700/50"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/60"
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 leading-relaxed">
          Educational use only. Not legal advice.
        </p>
      </div>
    </aside>
  );
}
