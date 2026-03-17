import React from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen, MessageSquare, FileText, Target, CreditCard,
  BarChart2, Scale, ClipboardList, BookMarked, Library, KeyRound,
} from "lucide-react";
import { clearApiKey } from "../api/client";

const NAV_PRIMARY = [
  { to: "/readings",   icon: BookOpen,      label: "Readings"   },
  { to: "/tutor",      icon: MessageSquare, label: "Tutor"      },
  { to: "/briefs",     icon: FileText,      label: "Briefs"     },
  { to: "/drills",     icon: Target,        label: "Drills"     },
  { to: "/flashcards", icon: CreditCard,    label: "Flashcards" },
  { to: "/progress",   icon: BarChart2,     label: "Progress"   },
];

const NAV_TOOLS = [
  { to: "/exam",     icon: ClipboardList, label: "Exams"    },
  { to: "/outline",  icon: BookMarked,    label: "Outlines" },
  { to: "/glossary", icon: Library,       label: "Glossary" },
];

interface SidebarProps {
  onClearKey?: () => void;
}

export function Sidebar({ onClearKey }: SidebarProps) {
  function handleChangeKey() {
    clearApiKey();
    onClearKey?.();
  }

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

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1 mb-4">
          {NAV_PRIMARY.map(({ to, icon: Icon, label }) => (
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
        </div>

        <div className="border-t border-gray-800 pt-3">
          <p className="text-xs text-gray-600 uppercase tracking-widest font-semibold px-3 mb-2">
            Study Tools
          </p>
          <div className="space-y-1">
            {NAV_TOOLS.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-900/30 text-emerald-300 border border-emerald-800/50"
                      : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/60"
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="px-3 py-4 border-t border-gray-800 space-y-2">
        <button
          onClick={handleChangeKey}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800/60 transition-all"
        >
          <KeyRound size={14} />
          Change API Key
        </button>
        <p className="text-xs text-gray-700 px-3 leading-relaxed">
          Educational use only. Not legal advice.
        </p>
      </div>
    </aside>
  );
}
