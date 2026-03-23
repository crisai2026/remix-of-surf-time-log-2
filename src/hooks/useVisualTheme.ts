import { useState, useEffect, useCallback } from "react";

export type VisualTheme = "claude" | "nostromo" | "macintosh" | "vaporwave" | "matrix";

const THEME_KEY = "marea-visual-theme";
const ALL_THEME_CLASSES = ["theme-claude", "theme-nostromo", "theme-macintosh", "theme-vaporwave", "theme-matrix"];

export function useVisualTheme() {
  const [theme, setThemeState] = useState<VisualTheme>(() => {
    return (localStorage.getItem(THEME_KEY) as VisualTheme) || "claude";
  });

  const setTheme = useCallback((t: VisualTheme) => {
    localStorage.setItem(THEME_KEY, t);
    setThemeState(t);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...ALL_THEME_CLASSES);
    root.classList.add(`theme-${theme}`);
    // No longer forces dark/light — useTheme handles that independently
  }, [theme]);

  return { visualTheme: theme, setVisualTheme: setTheme };
}
