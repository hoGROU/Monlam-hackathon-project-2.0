import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "tra.session";

const AuthContext = createContext(null);

/**
 * Lightweight client-side session.
 *
 * The hackathon build has no auth backend, so accounts live in localStorage.
 * A "demo" session is deliberately identical in capability to a registered
 * one — it simply skips the form so judges can jump straight in.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Restore any previous session on first mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* corrupted session — ignore and start fresh */
    }
    setReady(true);
  }, []);

  const persist = useCallback((next) => {
    setUser(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* storage unavailable (private mode) — session stays in memory */
    }
  }, []);

  const signUp = useCallback(
    ({ name, email }) => {
      const trimmed = (name || "").trim() || (email || "").split("@")[0] || "Researcher";
      persist({
        name: trimmed,
        email: (email || "").trim(),
        initials: initialsOf(trimmed),
        isDemo: false,
        createdAt: new Date().toISOString(),
      });
    },
    [persist]
  );

  const startDemo = useCallback(() => {
    persist({
      name: "Demo Explorer",
      email: "demo@codetitan.ai",
      initials: "DE",
      isDemo: true,
      createdAt: new Date().toISOString(),
    });
  }, [persist]);

  const signOut = useCallback(() => persist(null), [persist]);

  const value = useMemo(
    () => ({ user, ready, isAuthenticated: !!user, signUp, startDemo, signOut }),
    [user, ready, signUp, startDemo, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function initialsOf(name) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
