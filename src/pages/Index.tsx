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
import { BarChart3, Clock, FolderOpen, LogOut } from "lucide-react";
import { useVisualTheme } from "@/hooks/useVisualTheme";
import { getThemeContent } from "@/lib/themeContent";
import { ActivityLog } from "@/components/ActivityLog";
import { useAppContext } from "@/contexts/AppContext";
import { DemoOverlay } from "@/components/DemoOverlay";

type AppMode = "tracker" | "alignment" | "log";
type TrackerTab = "timer" | "dashboard" | "projects";
type AlignmentTab = "now" | "week";

export default function Index() {
  const [mode, setMode] = useState<AppMode>("tracker");
  const [trackerTab, setTrackerTab] = useState<TrackerTab>("timer");
  const [alignmentTab, setAlignmentTab] = useState<AlignmentTab>("now");
  const { visualTheme } = useVisualTheme();
  const content = getThemeContent(visualTheme);
  const { user, signOut, mode: appMode } = useAppContext();
  const isDemo = appMode === "demo";

  return (
    <div className="min-h-screen bg-background pb-14">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-5 py-3">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-lg font-semibold text-foreground tracking-tight shrink-0">{content.appTitle}</h1>
            {content.easterEgg && (
              <span className="text-[11px] text-muted-foreground/70 tracking-wider truncate">{content.easterEgg}</span>
            )}
            <div className="ml-auto shrink-0 flex items-center gap-1">
              {!isDemo && <ThemeSelector />}
              {user && (
                <button
                  onClick={() => signOut()}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  title="Log out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Top-level mode toggle */}
          <div className="flex bg-secondary rounded-lg p-0.5">
            {(["tracker", "alignment", "log"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                  mode === m
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground"
                }`}
              >
                {m === "tracker" ? "Tracker" : m === "alignment" ? "Alignment" : "Log"}
              </button>
            ))}
          </div>

          {/* Sub-navigation */}
          {mode === "tracker" ? (
            <nav className="flex gap-1 mt-2 bg-secondary/50 rounded-lg p-0.5 w-fit">
              <NavIcon active={trackerTab === "timer"} onClick={() => setTrackerTab("timer")} title="Timer">
                <Clock className="h-3.5 w-3.5" />
              </NavIcon>
              <NavIcon active={trackerTab === "projects"} onClick={() => setTrackerTab("projects")} title="Engines">
                <FolderOpen className="h-3.5 w-3.5" />
              </NavIcon>
              <NavIcon active={trackerTab === "dashboard"} onClick={() => setTrackerTab("dashboard")} title="Dashboard">
                <BarChart3 className="h-3.5 w-3.5" />
              </NavIcon>
            </nav>
          ) : mode === "alignment" ? (
            <div className="flex gap-1 mt-2 bg-secondary/50 rounded-lg p-0.5 w-fit">
              <button
                onClick={() => setAlignmentTab("now")}
                className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                  alignmentTab === "now" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Now
              </button>
              <button
                onClick={() => setAlignmentTab("week")}
                className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                  alignmentTab === "week" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                My week
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <main className="max-w-xl mx-auto px-5 py-6 space-y-6">
        {mode === "tracker" ? (
          trackerTab === "timer" ? (
            <>
              {isDemo ? (
                <>
                  <DemoOverlay><Timer /></DemoOverlay>
                  <DemoOverlay><ManualEntry /></DemoOverlay>
                </>
              ) : (
                <>
                  <Timer />
                  <ManualEntry />
                </>
              )}
              <TimelineView />
            </>
          ) : trackerTab === "projects" ? (
            isDemo ? <DemoOverlay><ProjectManager /></DemoOverlay> : <ProjectManager />
          ) : (
            <DashboardCharts />
          )
        ) : mode === "alignment" ? (
          alignmentTab === "now" ? (
            <AlignmentAhora />
          ) : (
            <AlignmentSemana />
          )
        ) : (
          <ActivityLog />
        )}
      </main>

      {!isDemo && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-card/80 backdrop-blur-sm">
          <div className="max-w-xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
            <ThemeToggle />
            <NotificationSettings />
            <span className="text-[11px] text-muted-foreground ml-2">Built with focus ✦</span>
          </div>
        </div>
      )}
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
