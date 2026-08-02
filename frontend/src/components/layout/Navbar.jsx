import { LogOut, Moon, ScrollText, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import GithubIcon from "../ui/GithubIcon";

function AccountMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        className="flex h-9 items-center gap-2 rounded-lg pl-1 pr-2 transition-colors hover:bg-ink-800"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-[11px] font-semibold text-white">
          {user.initials}
        </span>
        <span className="hidden text-xs font-medium text-ink-300 sm:block">{user.name}</span>
        {user.isDemo && (
          <span className="hidden rounded-md border border-gold-600/40 bg-gold-600/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gold-400 sm:block">
            Demo
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-56 animate-fade-up overflow-hidden rounded-xl border border-ink-700 bg-ink-900/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="border-b border-ink-800 px-3.5 py-3">
            <p className="truncate text-sm font-medium text-ink-100">{user.name}</p>
            <p className="truncate text-[11px] text-ink-500">{user.email}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-xs text-ink-300 transition-colors hover:bg-ink-800 hover:text-ink-50"
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-800/70 bg-ink-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-600/25 transition-transform group-hover:scale-105">
            <ScrollText size={18} strokeWidth={2} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-base font-semibold text-ink-50">
              Tibetan Research Assistant
            </span>
            <span className="mt-0.5 hidden text-[11px] font-medium uppercase tracking-[0.14em] text-primary-400 sm:block">
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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-50"
          >
            <GithubIcon size={18} />
          </a>
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-50"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <AccountMenu />
        </nav>
      </div>
    </header>
  );
}
