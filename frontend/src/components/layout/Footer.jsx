import { ExternalLink, ScrollText } from "lucide-react";
import GithubIcon from "../ui/GithubIcon";

export default function Footer() {
  return (
    <footer className="border-t border-ink-800/70 bg-ink-950/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                <ScrollText size={14} />
              </span>
              <span className="font-display text-sm font-semibold text-ink-50">
                Tibetan Research Assistant
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-400">
              Built for a hackathon exploring OCR and machine translation for
              classical Tibetan manuscripts. All results shown are demo /
              placeholder data — no documents are sent to a live backend.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm sm:flex sm:gap-16">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
                Project
              </p>
              <ul className="space-y-2 text-ink-400">
                <li>Hackathon 2026</li>
                <li>Team: Code Titan</li>
                <li>Status: Prototype</li>
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">
                Links
              </p>
              <ul className="space-y-2 text-ink-400">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-primary-400"
                  >
                    <GithubIcon size={14} /> Repository
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="inline-flex items-center gap-1.5 hover:text-primary-400"
                  >
                    <ExternalLink size={14} /> Devpost
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rule-gold my-8" />

        <p className="text-center text-xs text-ink-500">
          Made with care for Tibetan studies · Not affiliated with any
          monastery, library, or archive · Demo data only
        </p>
      </div>
    </footer>
  );
}