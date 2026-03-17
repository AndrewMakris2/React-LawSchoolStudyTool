import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Scale, BookOpen, MessageSquare, FileText, Target, CreditCard,
  BarChart2, ArrowRight, Sparkles, ClipboardList, BookMarked, Library, KeyRound,
} from "lucide-react";

const FEATURES = [
  {
    icon: BookOpen,
    title: "Readings",
    description: "Paste or upload case excerpts. Tag by course. Build your reading library.",
    href: "/readings",
    color: "text-blue-400",
    bg: "bg-blue-900/20 border-blue-800/50",
  },
  {
    icon: MessageSquare,
    title: "Socratic Tutor",
    description: "Get cold-called by an AI professor. Answer questions, get graded, improve.",
    href: "/tutor",
    color: "text-law-400",
    bg: "bg-law-900/20 border-law-800/50",
  },
  {
    icon: FileText,
    title: "Case Briefs",
    description: "Auto-generate structured briefs. Edit them. Polish your rule statements.",
    href: "/briefs",
    color: "text-emerald-400",
    bg: "bg-emerald-900/20 border-emerald-800/50",
  },
  {
    icon: Target,
    title: "Issue Spotting Drills",
    description: "Timed hypotheticals graded on IRAC rubric. Track your score over time.",
    href: "/drills",
    color: "text-orange-400",
    bg: "bg-orange-900/20 border-orange-800/50",
  },
  {
    icon: CreditCard,
    title: "Flashcards",
    description: "AI-generated cards from your readings. Spaced repetition keeps you sharp.",
    href: "/flashcards",
    color: "text-pink-400",
    bg: "bg-pink-900/20 border-pink-800/50",
  },
  {
    icon: BarChart2,
    title: "Progress",
    description: "Track drill scores, streaks, and improvement across every subject.",
    href: "/progress",
    color: "text-yellow-400",
    bg: "bg-yellow-900/20 border-yellow-800/50",
  },
  {
    icon: ClipboardList,
    title: "Practice Exams",
    description: "Timed mixed-format exams (MC + essay). AI-graded with per-question feedback.",
    href: "/exam",
    color: "text-violet-400",
    bg: "bg-violet-900/20 border-violet-800/50",
  },
  {
    icon: BookMarked,
    title: "Outline Builder",
    description: "Generate hierarchical course outlines from your readings. Exam-ready structure.",
    href: "/outline",
    color: "text-cyan-400",
    bg: "bg-cyan-900/20 border-cyan-800/50",
  },
  {
    icon: Library,
    title: "Legal Glossary",
    description: "Extract and save key legal terms with definitions from your case readings.",
    href: "/glossary",
    color: "text-teal-400",
    bg: "bg-teal-900/20 border-teal-800/50",
  },
];

const COURSES = [
  "Contracts", "Torts", "Civil Procedure",
  "Criminal Law", "Property", "Constitutional Law",
];

interface HomeProps {
  onSetupKey?: () => void;
}

export function Home({ onSetupKey }: HomeProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-law-700/20 rounded-full blur-3xl" />
          <div className="absolute -top-20 right-20 w-72 h-72 bg-blue-700/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-law-700/30 border border-law-700/50 rounded-2xl">
              <Scale className="text-law-400" size={32} />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-gray-100 leading-tight mb-6">
            Your 1L{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-law-400 to-blue-400">
              AI Study Partner
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-4">
            Built for first-year law students. Master case readings, survive cold calls,
            build airtight briefs, drill issue spotting, and ace practice exams — all in one place.
          </p>

          <div className="flex items-center justify-center gap-2 mb-10">
            <Sparkles size={16} className="text-law-400" />
            <p className="text-sm text-gray-500">
              Powered by Groq · Your API key · Educational use only · Not legal advice
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/readings")}
              className="flex items-center gap-2 px-8 py-4 bg-law-600 hover:bg-law-500 text-white font-semibold rounded-xl transition-all text-base shadow-lg shadow-law-900/50"
            >
              Get Started <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate("/exam")}
              className="flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-gray-100 font-semibold rounded-xl transition-all text-base border border-gray-700"
            >
              Take a Practice Exam <ClipboardList size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Course Tags */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-gray-600 mr-2 uppercase tracking-wide font-medium">Covers</span>
          {COURSES.map((c) => (
            <span
              key={c}
              className="px-3 py-1 bg-gray-900 border border-gray-800 rounded-full text-xs text-gray-400 font-medium"
            >
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-widest mb-8">
          Everything you need for 1L
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, description, href, color, bg }) => (
            <button
              key={href}
              onClick={() => navigate(href)}
              className={`group text-left p-6 rounded-2xl border ${bg} hover:scale-[1.02] transition-all duration-200`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-xl bg-gray-950/50">
                  <Icon className={color} size={22} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-gray-600 group-hover:text-gray-400 group-hover:translate-x-1 transition-all"
                />
              </div>
              <h3 className="font-bold text-gray-100 mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-gray-100 mb-6 text-center">
            How to use this tool
          </h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { step: "1", label: "Add a Reading", desc: "Paste a case or upload a .txt file", icon: BookOpen },
              { step: "2", label: "Generate a Brief", desc: "AI builds your case brief instantly", icon: FileText },
              { step: "3", label: "Study with Tutor", desc: "Get cold-called on the material", icon: MessageSquare },
              { step: "4", label: "Exam & Track", desc: "Practice exams and watch scores rise", icon: ClipboardList },
            ].map(({ step, label, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="w-10 h-10 bg-law-700/30 border border-law-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-law-400 font-bold text-sm">{step}</span>
                </div>
                <Icon className="mx-auto text-gray-500 mb-2" size={18} />
                <p className="text-sm font-semibold text-gray-200 mb-1">{label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-900 py-8 text-center">
        <p className="text-xs text-gray-600 mb-2">
          LawStudy 1L Edition · Powered by Groq AI · Educational purposes only · Not legal advice
        </p>
        {onSetupKey && (
          <button
            onClick={onSetupKey}
            className="inline-flex items-center gap-1.5 text-xs text-gray-700 hover:text-gray-500 transition-colors"
          >
            <KeyRound size={11} />
            Change API Key
          </button>
        )}
      </div>
    </div>
  );
}
