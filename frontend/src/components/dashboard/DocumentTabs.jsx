import { BookOpen, Languages, Sparkles, Tags } from "lucide-react";
import { useState } from "react";
import KeywordCard from "./KeywordCard";
import OriginalTextCard from "./OriginalTextCard";
import SummaryCard from "./SummaryCard";
import TranslationCard from "./TranslationCard";

const TABS = [
  { key: "original", label: "Original Text", icon: BookOpen, component: OriginalTextCard },
  { key: "translation", label: "Translation", icon: Languages, component: TranslationCard },
  { key: "summary", label: "AI Summary", icon: Sparkles, component: SummaryCard },
  { key: "keywords", label: "Keywords", icon: Tags, component: KeywordCard },
];

export default function DocumentTabs() {
  const [active, setActive] = useState("original");
  const ActiveComponent = TABS.find((t) => t.key === active)?.component;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Document views"
        className="flex gap-1 overflow-x-auto rounded-xl border border-ink-800 bg-ink-900 p-1.5"
      >
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all sm:px-4 ${
                isActive
                  ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-600/25"
                  : "text-ink-400 hover:bg-ink-800 hover:text-ink-100"
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 animate-fade-up" key={active}>
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}