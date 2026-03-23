import { useState } from "react";
import { Timer } from "@/components/Timer";
import { TimelineView } from "@/components/TimelineView";
import { ManualEntry } from "@/components/ManualEntry";
import { DashboardCharts } from "@/components/DashboardCharts";
import { ProjectManager } from "@/components/ProjectManager";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationSettings } from "@/components/NotificationSettings";
import { ThemeSelector } from "@/components/ThemeSelector";
import { AlignmentAhora } from "@/components/AlignmentAhora";
import { AlignmentSemana } from "@/components/AlignmentSemana";
import { BarChart3, Clock, FolderOpen } from "lucide-react";
import { useVisualTheme } from "@/hooks/useVisualTheme";
import { getThemeContent } from "@/lib/themeContent";

type AppMode = "tracker" | "alignment";
type TrackerTab = "timer" | "dashboard" | "projects";
type AlignmentTab = "ahora" | "semana";

export default function Index() {
  const [mode, setMode] = useState<AppMode>("tracker");
  const [trackerTab, setTrackerTab] = useState<TrackerTab>("timer");
  const [alignmentTab, setAlignmentTab] = useState<AlignmentTab>("ahora");
  const { visualTheme } = useVisualTheme();
  const content = getThemeContent(visualTheme);

  return (
    <div className="min-h-screen bg-background pb-14">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-5 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline gap-2">
              <h1 className="text-lg font-semibold text-foreground tracking-tight">{content.appTitle}</h1>
              {content.subtitle && <span className="text-[10px] text-muted-foreground tracking-wide">{content.subtitle}</span>}
            </div>
            <ThemeSelector />
          </div>

          {/* Top-level mode toggle */}
          <div className="flex bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => setMode("tracker")}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                mode === "tracker"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Tracker
            </button>
            <button
              onClick={() => setMode("alignment")}
              className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                mode === "alignment"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Alignment
            </button>
          </div>

          {/* Sub-navigation */}
          {mode === "tracker" ? (
            <nav className="flex gap-1 mt-2 bg-secondary/50 rounded-lg p-0.5 w-fit">
              <NavIcon active={trackerTab === "timer"} onClick={() => setTrackerTab("timer")} title="Timer">
                <Clock className="h-3.5 w-3.5" />
              </NavIcon>
              <NavIcon active={trackerTab === "projects"} onClick={() => setTrackerTab("projects")} title="Motores">
                <FolderOpen className="h-3.5 w-3.5" />
              </NavIcon>
              <NavIcon active={trackerTab === "dashboard"} onClick={() => setTrackerTab("dashboard")} title="Dashboard">
                <BarChart3 className="h-3.5 w-3.5" />
              </NavIcon>
            </nav>
          ) : (
            <div className="flex gap-1 mt-2 bg-secondary/50 rounded-lg p-0.5 w-fit">
              <button
                onClick={() => setAlignmentTab("ahora")}
                className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                  alignmentTab === "ahora" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Ahora
              </button>
              <button
                onClick={() => setAlignmentTab("semana")}
                className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                  alignmentTab === "semana" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Mi semana
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-5 py-6 space-y-6">
        {mode === "tracker" ? (
          trackerTab === "timer" ? (
            <>
              <Timer />
              <ManualEntry />
              <TimelineView />
            </>
          ) : trackerTab === "projects" ? (
            <ProjectManager />
          ) : (
            <DashboardCharts />
          )
        ) : (
          alignmentTab === "ahora" ? (
            <AlignmentAhora />
          ) : (
            <AlignmentSemana />
          )
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
          <ThemeToggle />
          <NotificationSettings />
          <span className="text-[11px] text-muted-foreground ml-2">{content.footerText}</span>
        </div>
      </div>
    </div>
  );
}

function NavIcon({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: React.ReactNode; title: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-md transition-all ${
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
