import type { VisualTheme } from "@/hooks/useVisualTheme";

interface ThemeContent {
  appTitle: string;
  footerText: string;
}

const themeContentMap: Record<VisualTheme, ThemeContent> = {
  claude: {
    appTitle: "Marea Timer",
    footerText: "Built with focus ✦",
  },
  nostromo: {
    appTitle: "MAREA TIMER",
    footerText: "WEYLAND-YUTANI CORP",
  },
  macintosh: {
    appTitle: "Marea Timer",
    footerText: "© 1984 Marea Systems Inc.",
  },
  vaporwave: {
    appTitle: "m a r e a ～ トラッカー",
    footerText: "ｖａｐｏｒ ～ ２０００",
  },
  matrix: {
    appTitle: "MAREA // CONSTRUCT",
    footerText: "Free your mind, Cris.",
  },
};

export function getThemeContent(theme: VisualTheme): ThemeContent {
  return themeContentMap[theme];
}
