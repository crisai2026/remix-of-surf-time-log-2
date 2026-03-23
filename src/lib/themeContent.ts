import type { VisualTheme } from "@/hooks/useVisualTheme";

interface ThemeContent {
  appTitle: string;
  easterEgg: string;
}

const themeContentMap: Record<VisualTheme, ThemeContent> = {
  claude: {
    appTitle: "Marea Timer",
    easterEgg: "",
  },
  nostromo: {
    appTitle: "MAREA TIMER",
    easterEgg: "WEYLAND-YUTANI CORP",
  },
  macintosh: {
    appTitle: "Marea Timer",
    easterEgg: "© 1984 Marea Systems Inc.",
  },
  vaporwave: {
    appTitle: "m a r e a",
    easterEgg: "～ トラッカー",
  },
  matrix: {
    appTitle: "MAREA // CONSTRUCT",
    easterEgg: "Free your mind, Cris.",
  },
};

export function getThemeContent(theme: VisualTheme): ThemeContent {
  return themeContentMap[theme];
}
