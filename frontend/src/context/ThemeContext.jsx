import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    const stored = window.localStorage.getItem("tra-theme");
    if (stored) return stored;
    return "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    // Both classes are toggled: the stylesheet keys its light overrides off
    // `.light`, so removing `.dark` alone would leave the UI stuck on dark.
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    // Keeps native controls (scrollbars, inputs) in sync with the theme.
    root.style.colorScheme = theme;
    window.localStorage.setItem("tra-theme", theme);
  }, [theme]);


  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}