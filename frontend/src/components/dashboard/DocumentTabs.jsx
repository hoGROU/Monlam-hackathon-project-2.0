import { useState } from "react";
import { BookOpen, Languages, Sparkles, Tags } from "lucide-react";
import OriginalTextCard from "./OriginalTextCard";
import TranslationCard from "./TranslationCard";
import SummaryCard from "./SummaryCard";
import KeywordCard from "./KeywordCard";

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
        className="flex gap-1 overflow-x-auto rounded-xl border border-ink-200 bg-white p-1.5 dark:border-ink-800 dark:bg-ink-900"
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
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-ink-500 hover:bg-ink-100 hover:text-ink-800 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100"
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
