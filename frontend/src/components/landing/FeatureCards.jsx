import {
  FileOutput,
  Languages,
  MessageCircleQuestion,
  ScanText,
  Sparkles,
} from "lucide-react";
import { featureCards } from "../../data/mockData";

const icons = {
  ocr: ScanText,
  translate: Languages,
  summary: Sparkles,
  ask: MessageCircleQuestion,
  export: FileOutput,
};

export default function FeatureCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-400">
          What it does
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold text-ink-50 sm:text-3xl">
          Every step from folio to footnote
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featureCards.map((feature, i) => {
          const Icon = icons[feature.key];
          return (
            <div
              key={feature.key}
              className="group relative overflow-hidden rounded-xl border border-ink-800 bg-ink-900/60 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary-700 hover:bg-ink-900 hover:shadow-xl hover:shadow-primary-900/30"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-950/60 text-primary-400 ring-1 ring-primary-800/50 transition-colors group-hover:bg-primary-600 group-hover:text-white group-hover:ring-primary-600">
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink-50">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-400">
                {feature.description}
              </p>
              <div className="absolute right-0 top-0 h-16 w-16 -translate-y-8 translate-x-8 rounded-full bg-primary-500/0 transition-colors group-hover:bg-primary-500/10" />
            </div>
          );
        })}
      </div>
    </section>
  );
}