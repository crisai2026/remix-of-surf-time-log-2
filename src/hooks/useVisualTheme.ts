import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

export type VisualTheme = "claude" | "nostromo" | "macintosh" | "vaporwave" | "matrix";

const THEME_KEY = "marea-visual-theme";
const ALL_THEME_CLASSES = ["theme-claude", "theme-nostromo", "theme-macintosh", "theme-vaporwave", "theme-matrix"];
const EVENT_NAME = "marea-theme-change";

let currentTheme: VisualTheme = (localStorage.getItem(THEME_KEY) as VisualTheme) || "claude";
let listeners: Array<() => void> = [];

function getSnapshot() {
  return currentTheme;
}

function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function setThemeGlobal(t: VisualTheme) {
  currentTheme = t;
  localStorage.setItem(THEME_KEY, t);

  const root = document.documentElement;
  root.classList.remove(...ALL_THEME_CLASSES);
  root.classList.add(`theme-${t}`);

  listeners.forEach((l) => l());
}

// Apply on load
(() => {
  const root = document.documentElement;
  root.classList.remove(...ALL_THEME_CLASSES);
  root.classList.add(`theme-${currentTheme}`);
})();

export function useVisualTheme() {
  const visualTheme = useSyncExternalStore(subscribe, getSnapshot);

  return { visualTheme, setVisualTheme: setThemeGlobal };
}
