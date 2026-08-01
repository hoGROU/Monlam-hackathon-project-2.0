import { Link } from "react-router-dom";
import { Moon, Sun, ScrollText } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import GithubIcon from "../ui/GithubIcon";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-200/70 bg-ink-50/80 backdrop-blur-md dark:border-ink-800/70 dark:bg-ink-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm shadow-primary-600/30 transition-transform group-hover:scale-105">
            <ScrollText size={18} strokeWidth={2} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-semibold text-ink-900 dark:text-ink-50">
              Tibetan Research Assistant
            </span>
            <span className="mt-0.5 hidden text-[11px] font-medium uppercase tracking-[0.14em] text-gold-600 dark:text-gold-400 sm:block">
              AI Manuscript Analysis
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="View source on GitHub"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-50"
          >
            <GithubIcon size={18} />
          </a>
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-50"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>
      </div>
    </header>
  );
}
