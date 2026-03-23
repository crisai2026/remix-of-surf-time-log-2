import { useSyncExternalStore } from "react";

export type VisualTheme = "claude" | "nostromo" | "macintosh" | "vaporwave" | "matrix";

const THEME_KEY = "marea-visual-theme";
const ALL_THEME_CLASSES = ["theme-claude", "theme-nostromo", "theme-macintosh", "theme-vaporwave", "theme-matrix"];

let currentTheme: VisualTheme = (localStorage.getItem(THEME_KEY) as VisualTheme) || "claude";
let listeners = new Set<() => void>();

function applyThemeClass(t: VisualTheme) {
  const root = document.documentElement;
  root.classList.remove(...ALL_THEME_CLASSES);
  root.classList.add(`theme-${t}`);
}

// Apply on load
applyThemeClass(currentTheme);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function getSnapshot() {
  return currentTheme;
}

function setThemeGlobal(t: VisualTheme) {
  currentTheme = t;
  localStorage.setItem(THEME_KEY, t);
  applyThemeClass(t);
  listeners.forEach((l) => l());
}

export function useVisualTheme() {
  const visualTheme = useSyncExternalStore(subscribe, getSnapshot);
  return { visualTheme, setVisualTheme: setThemeGlobal };
}
