import React, { useMemo, useState } from "react";
import {
  GraduationCap, ChevronRight, BookOpen, Scale, Landmark, Library,
} from "lucide-react";
import { PrintButton } from "../components/PrintButton";
import {
  FIRST_YEAR_COURSES, UPPER_LEVEL_COURSES, ALL_COURSES,
  PART_I_SECTIONS, PART_III_SECTIONS, PART_IV_RESOURCES,
  LEGAL_GLOSSARY, LATIN_TERMS, CASE_BRIEF_TEMPLATE, IRAC_TEMPLATE,
  CourseChapter, InfoSection, ResourceCategory,
} from "../data/texasTechGuide";

type SectionKind = "welcome" | "info" | "course" | "resource" | "glossary" | "latin" | "brief" | "irac";

interface NavLeaf {
  id: string;
  label: string;
  kind: SectionKind;
}

interface NavGroup {
  title: string;
  items: NavLeaf[];
}

const infoMap = new Map<string, InfoSection>(
  [...PART_I_SECTIONS, ...PART_III_SECTIONS].map((s) => [s.id, s])
);
const courseMap = new Map<string, CourseChapter>(ALL_COURSES.map((c) => [c.id, c]));
const resourceMap = new Map<string, ResourceCategory>(PART_IV_RESOURCES.map((r) => [r.id, r]));

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Part I — Before You Start",
    items: PART_I_SECTIONS.map((s) => ({ id: s.id, label: s.title, kind: "info" })),
  },
  {
    title: "Part II — 1L Required Courses",
    items: FIRST_YEAR_COURSES.map((c) => ({ id: c.id, label: c.title, kind: "course" })),
  },
  {
    title: "Part II — Upper-Level Required Courses",
    items: UPPER_LEVEL_COURSES.map((c) => ({ id: c.id, label: c.title, kind: "course" })),
  },
  {
    title: "Part III — Texas Tech Opportunities",
    items: PART_III_SECTIONS.map((s) => ({ id: s.id, label: s.title, kind: "info" })),
  },
  {
    title: "Part IV — Resources",
    items: PART_IV_RESOURCES.map((r) => ({ id: r.id, label: r.title, kind: "resource" })),
  },
  {
    title: "Part V — Appendices",
    items: [
      { id: "glossary", label: "Legal Glossary", kind: "glossary" },
      { id: "latin", label: "Common Latin Terms", kind: "latin" },
      { id: "brief-template", label: "Case Brief Template", kind: "brief" },
      { id: "irac-template", label: "IRAC Template", kind: "irac" },
    ],
  },
];

function CourseView({ course }: { course: CourseChapter }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border bg-cyan-900/40 text-cyan-300 border-cyan-800">
            {course.year}
          </span>
          {course.courseCode && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border bg-gray-800 text-gray-300 border-gray-700">
              {course.courseCode}
            </span>
          )}
          {course.creditHours && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border bg-gray-800 text-gray-300 border-gray-700">
              {course.creditHours} credit{course.creditHours === 1 ? "" : "s"}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-100">{course.title}</h1>
      </div>

      <Section title="Overview">{course.overview}</Section>
      <Section title="Purpose">{course.purpose}</Section>

      <SectionList title="Learning Objectives" items={course.learningObjectives} />
      <SectionList title="Major Topics" items={course.majorTopics} />

      <Section title="Typical Course Structure">{course.courseStructure}</Section>
      <Section title="Assessment">{course.assessment}</Section>

      {course.landmarkCases.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-law-400 uppercase tracking-wide mb-3">Landmark Cases</h2>
          <div className="space-y-3">
            {course.landmarkCases.map((c) => (
              <div key={c.name} className="border-l-2 border-law-800/60 pl-4 py-0.5">
                <p className="font-semibold text-gray-100 text-sm">{c.name}</p>
                <p className="text-sm text-gray-400 leading-relaxed mt-0.5">{c.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <SectionList title="Study Strategies" items={course.studyStrategies} />
      <SectionList title="Common Challenges" items={course.commonChallenges} />
      <SectionList title="Recommended Resources" items={course.resources} />

      <div className="bg-law-900/20 border border-law-800/40 rounded-xl p-5">
        <h2 className="text-xs font-semibold text-law-400 uppercase tracking-wide mb-2">Quick Review</h2>
        <p className="text-sm text-gray-200 leading-relaxed">{course.summary}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-law-400 uppercase tracking-wide mb-2">{title}</h2>
      <p className="text-sm text-gray-300 leading-relaxed">{children}</p>
    </div>
  );
}

function SectionList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h2 className="text-sm font-semibold text-law-400 uppercase tracking-wide mb-2">{title}</h2>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-gray-300 leading-relaxed">
            <span className="text-law-500 mt-1.5 shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoView({ section }: { section: InfoSection }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-100">{section.title}</h1>
      {section.paragraphs.map((p, i) => (
        <p key={i} className="text-sm text-gray-300 leading-relaxed">{p}</p>
      ))}
      {section.bullets && (
        <ul className="space-y-1.5">
          {section.bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-gray-300 leading-relaxed">
              <span className="text-law-500 mt-1.5 shrink-0">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ResourceView({ category }: { category: ResourceCategory }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-100">{category.title}</h1>
      <div className="space-y-3">
        {category.items.map((item) => (
          <div key={item.name} className="border-l-2 border-law-800/60 pl-4 py-0.5">
            <p className="font-semibold text-gray-100 text-sm">{item.name}</p>
            <p className="text-sm text-gray-400 leading-relaxed mt-0.5">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlossaryView() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-100">Legal Glossary</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {LEGAL_GLOSSARY.map((g) => (
          <div key={g.term} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="font-semibold text-law-300 text-sm">{g.term}</p>
            <p className="text-sm text-gray-400 leading-relaxed mt-1">{g.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LatinView() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-100">Common Latin Terms</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {LATIN_TERMS.map((t) => (
          <div key={t.term} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="font-semibold text-law-300 text-sm italic">{t.term}</p>
            <p className="text-sm text-gray-400 leading-relaxed mt-1">{t.meaning}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplateView({ title, sections }: { title: string; sections: { label: string; prompt: string }[] }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-100">{title}</h1>
      <div className="space-y-4">
        {sections.map((s, i) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-law-400 uppercase tracking-wide mb-1">
              {i + 1}. {s.label}
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">{s.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WelcomeView({ onNavigate }: { onNavigate: (id: string) => void }) {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-law-900/40 to-gray-900 border border-law-800/40 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-law-700/30 border border-law-700/50 rounded-xl">
            <GraduationCap className="text-law-300" size={26} />
          </div>
          <div>
            <p className="text-xs text-law-400 uppercase tracking-widest font-semibold">Prepared for Zackary MacMillin</p>
            <h1 className="text-2xl font-bold text-gray-100">Texas Tech School of Law Success Guide</h1>
          </div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed max-w-2xl">
          Zackary — congratulations on Texas Tech. This guide is built specifically to get you ready for
          the Red Raider J.D. program before you get to Lubbock: the full required curriculum, course by course,
          what to expect from the Socratic method and curved grading, and the clinics, moot court, and journal
          opportunities that make Texas Tech's program distinctive. Use the navigator on the left to jump straight
          to any course, or start with Part I below.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigate("ttu-overview")}
          className="text-left bg-gray-900 border border-gray-800 hover:border-law-700 rounded-xl p-5 transition-colors"
        >
          <Landmark className="text-law-400 mb-2" size={20} />
          <p className="font-semibold text-gray-100 text-sm">Part I — Before You Start</p>
          <p className="text-xs text-gray-500 mt-1">TTU overview, curriculum structure, how law school works</p>
        </button>
        <button
          onClick={() => onNavigate(FIRST_YEAR_COURSES[0].id)}
          className="text-left bg-gray-900 border border-gray-800 hover:border-law-700 rounded-xl p-5 transition-colors"
        >
          <BookOpen className="text-law-400 mb-2" size={20} />
          <p className="font-semibold text-gray-100 text-sm">Part II — Required Courses</p>
          <p className="text-xs text-gray-500 mt-1">Every 1L and upper-level required course, same format every time</p>
        </button>
        <button
          onClick={() => onNavigate("clinics")}
          className="text-left bg-gray-900 border border-gray-800 hover:border-law-700 rounded-xl p-5 transition-colors"
        >
          <Scale className="text-law-400 mb-2" size={20} />
          <p className="font-semibold text-gray-100 text-sm">Part III — TTU Opportunities</p>
          <p className="text-xs text-gray-500 mt-1">Clinics, Board of Barristers, Law Review, Career Services</p>
        </button>
        <button
          onClick={() => onNavigate("glossary")}
          className="text-left bg-gray-900 border border-gray-800 hover:border-law-700 rounded-xl p-5 transition-colors"
        >
          <Library className="text-law-400 mb-2" size={20} />
          <p className="font-semibold text-gray-100 text-sm">Part V — Appendices</p>
          <p className="text-xs text-gray-500 mt-1">Glossary, Latin terms, case brief and IRAC templates</p>
        </button>
      </div>

      <div className="text-xs text-gray-600 leading-relaxed border-t border-gray-800 pt-4">
        Curriculum facts (course codes, credit hours, sequencing, clinics, journals, and outcomes) are sourced
        from official Texas Tech School of Law publications. This guide is a preparation companion — it does not
        replace official course instruction, casebooks, or Texas Tech's own academic advising.
      </div>
    </div>
  );
}

export function TexasTech() {
  const [activeId, setActiveId] = useState("welcome");

  const activeCourse = courseMap.get(activeId);
  const activeInfo = infoMap.get(activeId);
  const activeResource = resourceMap.get(activeId);

  const content = useMemo(() => {
    if (activeId === "welcome") return <WelcomeView onNavigate={setActiveId} />;
    if (activeCourse) return <CourseView course={activeCourse} />;
    if (activeInfo) return <InfoView section={activeInfo} />;
    if (activeResource) return <ResourceView category={activeResource} />;
    if (activeId === "glossary") return <GlossaryView />;
    if (activeId === "latin") return <LatinView />;
    if (activeId === "brief-template") return <TemplateView title="Case Brief Template" sections={CASE_BRIEF_TEMPLATE.sections} />;
    if (activeId === "irac-template") return <TemplateView title="IRAC Template" sections={IRAC_TEMPLATE.sections} />;
    return <WelcomeView onNavigate={setActiveId} />;
  }, [activeId, activeCourse, activeInfo, activeResource]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* In-page navigator */}
        <div className="no-print lg:col-span-1">
          <div className="sticky top-6 space-y-5 max-h-[calc(100vh-3rem)] overflow-y-auto pr-1">
            <button
              onClick={() => setActiveId("welcome")}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeId === "welcome"
                  ? "bg-law-700/30 text-law-300 border border-law-700/50"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/60"
              }`}
            >
              <GraduationCap size={16} />
              Guide Home
            </button>

            {NAV_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-1.5">
                  {group.title}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveId(item.id)}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-left transition-all ${
                        activeId === item.id
                          ? "bg-law-700/30 text-law-300 border border-law-700/50"
                          : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/60"
                      }`}
                    >
                      <ChevronRight size={11} className="shrink-0 opacity-60" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content pane */}
        <div className="lg:col-span-4">
          <div className="printable-area bg-gray-900/40 border border-gray-800 rounded-2xl p-8">
            <div className="no-print flex justify-end mb-4">
              <PrintButton label="Print this section" />
            </div>
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
