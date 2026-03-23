import type { VisualTheme } from "@/hooks/useVisualTheme";

interface ThemeContent {
  appTitle: string;
  subtitle: string;
}

const themeContentMap: Record<VisualTheme, ThemeContent> = {
  claude: {
    appTitle: "Marea Timer",
    subtitle: "",
  },
  nostromo: {
    appTitle: "MAREA TIMER",
    subtitle: "WEYLAND-YUTANI CORP",
  },
  macintosh: {
    appTitle: "Marea Timer",
    subtitle: "© 1984 Marea Systems Inc.",
  },
  vaporwave: {
    appTitle: "m a r e a ～ トラッカー",
    subtitle: "～ トラッカー",
  },
  matrix: {
    appTitle: "MAREA // CONSTRUCT",
    subtitle: "Free your mind, Cris.",
  },
};

export function getThemeContent(theme: VisualTheme): ThemeContent {
  return themeContentMap[theme];
}
