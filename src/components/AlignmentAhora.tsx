import { useState, useEffect, useMemo } from "react";
import { Play, Pause, Square, Plus } from "lucide-react";
import {
  getCurrentBlock, getNextBlock, getTodayPlan, getCurrentDayIndex,
  getDayName, CATEGORY_STYLES, ACTIVITY_OPTIONS, CATEGORY_TO_PROJECT,
  timeToMinutes, type PlanBlock,
} from "@/lib/weeklyPlan";
import { useProjects } from "@/lib/hooks/useProjects";
import { useRunningEntry, useStartTimer, useStopTimer, usePauseTimer, useResumeTimer } from "@/lib/hooks/useTimeEntries";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { formatTimer } from "@/lib/formatTime";
import { toast } from "sonner";

// Case-insensitive reverse lookup: project name → category
function buildProjectToCategory(): Record<string, string> {
  const map: Record<string, string> = {};
  Object.entries(CATEGORY_TO_PROJECT).forEach(([cat, name]) => {
    map[name.toLowerCase()] = cat;
  });
  return map;
}
const PROJECT_TO_CATEGORY = buildProjectToCategory();

function getProjectCategory(projectName: string): string | null {
  return PROJECT_TO_CATEGORY[projectName.toLowerCase()] || null;
}

function useDarkMode() {
  return document.documentElement.classList.contains("dark");
}

function CategoryBg({ category, children, className = "", selected = false, projectColor }: {
  category: string; children: React.ReactNode; className?: string; selected?: boolean; projectColor?: string;
}) {
  const dark = useDarkMode();
  const style = CATEGORY_STYLES[category];
  const color = projectColor || style?.textColor;
  if (!color && !style) return <div className={className}>{children}</div>;
  return (
    <div
      className={`${className} ${selected ? "ring-2 ring-primary shadow-md" : ""}`}
      style={{
        backgroundColor: projectColor
          ? (dark ? `${projectColor}20` : `${projectColor}15`)
          : (dark ? style?.darkBg : style?.lightBg),
        color: color,
      }}
    >
      {children}
    </div>
  );
}

export function AlignmentAhora() {
  const { data: projects } = useProjects();
  const { data: running } = useRunningEntry();
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();
  const pauseTimer = usePauseTimer();
  const resumeTimer = useResumeTimer();
  const queryClient = useQueryClient();

  const [elapsed, setElapsed] = useState(0);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [outOfPlanText, setOutOfPlanText] = useState("");
  const [showOutOfPlan, setShowOutOfPlan] = useState(false);
  const [, forceUpdate] = useState(0);

  // Refresh current block every 30s
  useEffect(() => {
    const id = setInterval(() => forceUpdate(n => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const currentResult = getCurrentBlock();
  const currentBlock = currentResult?.block || null;
  const nextBlock = getNextBlock();
  const todayPlan = getTodayPlan();
  const dayIndex = getCurrentDayIndex();
  const dayName = getDayName(dayIndex);
  const today = new Date();

  // Build category → DB project color lookup
  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!projects) return map;
    for (const p of projects) {
      const cat = getProjectCategory(p.name);
      if (cat) map[cat] = p.color;
    }
    return map;
  }, [projects]);

  // Derive active category from running entry (case-insensitive)
  const activeCategory = useMemo(() => {
    if (!running) return null;
    const projectName = (running.projects as any)?.name;
    if (!projectName) return null;
    return getProjectCategory(projectName);
  }, [running]);

  // Display info - use description for out-of-plan entries
  const isOutOfPlan = running?.is_out_of_plan === true;
  const displayCategory = isOutOfPlan ? null : (activeCategory || currentBlock?.category || null);
  const displayActivity = isOutOfPlan
    ? (running?.description || "Fuera de plan")
    : activeCategory
      ? (ACTIVITY_OPTIONS.find(a => a.category === activeCategory)?.label ||
         CATEGORY_TO_PROJECT[activeCategory] ||
         (running?.projects as any)?.name || activeCategory)
      : currentBlock?.activity || "Tiempo libre";

  const plannedCategory = currentBlock?.category || null;
  const isDeviated = !isOutOfPlan && activeCategory !== null && activeCategory !== plannedCategory;
  const isPaused = running && (running as any).paused_at;

  useEffect(() => {
    if (!running) { setElapsed(0); return; }
    const pausedSec = (running as any).paused_seconds || 0;
    const tick = () => {
      if ((running as any).paused_at) {
        const pausedAt = new Date((running as any).paused_at).getTime();
        const totalElapsed = Math.floor((pausedAt - new Date(running.start_time).getTime()) / 1000);
        setElapsed(totalElapsed - pausedSec);
      } else {
        const totalElapsed = Math.floor((Date.now() - new Date(running.start_time).getTime()) / 1000);
        setElapsed(totalElapsed - pausedSec);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running]);

  const findOrCreateProject = async (category: string): Promise<string | null> => {
    const projectName = CATEGORY_TO_PROJECT[category];
    if (!projectName) return null;

    // Case-insensitive match
    const existing = projects?.find(p => p.name.toLowerCase() === projectName.toLowerCase());
    if (existing) return existing.id;

    const style = CATEGORY_STYLES[category];
    const { data, error } = await supabase
      .from("projects")
      .insert({ name: projectName, color: style?.textColor || "#888" })
      .select()
      .single();

    if (error) {
      toast.error("Error al crear proyecto");
      return null;
    }

    queryClient.invalidateQueries({ queryKey: ["projects"] });
    return data.id;
  };

  const handleStartActivity = async (category: string) => {
    const projectId = await findOrCreateProject(category);
    if (!projectId) return;

    setShowSwitcher(false);
    setShowOutOfPlan(false);

    startTimer.mutate({ projectId });
  };

  const handleToggleTimer = async () => {
    if (!running) {
      if (displayCategory) {
        await handleStartActivity(displayCategory);
      } else {
        setShowSwitcher(true);
      }
    }
  };

  const handlePauseResume = () => {
    if (!running) return;
    if (isPaused) {
      resumeTimer.mutate(running.id);
    } else {
      pauseTimer.mutate(running.id);
    }
  };

  const handleStop = () => {
    if (running) {
      stopTimer.mutate(running.id);
    }
  };

  const handleOutOfPlan = async () => {
    if (!outOfPlanText.trim()) return;

    // Use the first available project as container (doesn't matter which, the entry is marked out-of-plan)
    const project = projects?.[0];
    if (!project) return;

    setShowSwitcher(false);
    setShowOutOfPlan(false);

    startTimer.mutate({
      projectId: project.id,
      description: outOfPlanText.trim(),
      isOutOfPlan: true,
      plannedCategory: currentBlock?.category || null,
    });

    setOutOfPlanText("");
  };

  const dbColor = displayCategory ? categoryColorMap[displayCategory] : null;
  const style = isOutOfPlan ? null : (displayCategory ? CATEGORY_STYLES[displayCategory] : null);
  const activeColor = dbColor || style?.textColor || null;
  const dark = useDarkMode();
  const nowMin = today.getHours() * 60 + today.getMinutes();

  return (
    <div className="space-y-4">
      {/* Day header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>
          {dayName}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {today.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Current block card */}
      <button
        onClick={() => setShowSwitcher(true)}
        className="w-full text-left rounded-2xl border border-border p-6 transition-all hover:shadow-md"
        style={{
          backgroundColor: isOutOfPlan
            ? "hsl(var(--card))"
            : activeColor ? (dark ? `${activeColor}20` : `${activeColor}15`) : "hsl(var(--card))",
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-3">
          {isOutOfPlan ? "FUERA DE PLAN" : "AHORA"}
        </p>

        <h3
          className="text-xl font-bold mb-1"
          style={{ color: isOutOfPlan ? "hsl(var(--foreground))" : (activeColor || "hsl(var(--foreground))"), fontFamily: "'DM Serif Display', serif" }}
        >
          {displayActivity}
        </h3>

        {currentBlock && !isOutOfPlan && (
          <p className="text-xs mb-2" style={{ color: activeColor || "hsl(var(--muted-foreground))", opacity: 0.7 }}>
            {currentBlock.start} – {currentBlock.end}
          </p>
        )}

        {!isOutOfPlan && style?.motorLabel && (
          <span
            className="inline-block text-[10px] px-2 py-0.5 rounded-full mb-2"
            style={{ backgroundColor: dark ? `${activeColor}20` : `${activeColor}15`, color: activeColor, border: `1px solid ${activeColor}20` }}
          >
            {style.motorLabel}
          </span>
        )}

        {isDeviated && plannedCategory && (
          <p className="text-[10px] mt-1 px-2 py-0.5 rounded-full inline-block bg-primary/10 text-primary">
            plan: {CATEGORY_TO_PROJECT[plannedCategory] || plannedCategory}
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <div>
            <span
              className={`text-3xl tabular-nums ${isPaused ? "opacity-50" : ""}`}
              style={{ color: isOutOfPlan ? "hsl(var(--foreground))" : (style?.textColor || "hsl(var(--foreground))"), fontWeight: 300 }}
            >
              {formatTimer(elapsed)}
            </span>
            {isPaused && (
              <span className="block text-[10px] uppercase tracking-wider text-primary font-medium mt-0.5">Pausado</span>
            )}
          </div>

          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {running ? (
              <>
                <div
                  onClick={handlePauseResume}
                  className="h-10 w-10 rounded-full flex items-center justify-center transition-colors cursor-pointer bg-secondary text-secondary-foreground"
                >
                  {isPaused ? <Play className="h-4 w-4 ml-0.5" /> : <Pause className="h-4 w-4" />}
                </div>
                <div
                  onClick={handleStop}
                  className="h-12 w-12 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  style={{
                    backgroundColor: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  <Square className="h-5 w-5" />
                </div>
              </>
            ) : (
              <div
                onClick={handleToggleTimer}
                className="h-12 w-12 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                style={{
                  backgroundColor: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                }}
              >
                <Play className="h-5 w-5 ml-0.5" />
              </div>
            )}
          </div>
        </div>
      </button>

      <p className="text-[10px] text-center text-muted-foreground">toca para cambiar actividad</p>

      {/* Next block */}
      {nextBlock && (
        <div className="rounded-xl bg-secondary/50 border border-border p-3 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_STYLES[nextBlock.category]?.textColor || "hsl(var(--muted-foreground))" }} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Siguiente</p>
            <p className="text-sm font-medium truncate">{nextBlock.activity}</p>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">{nextBlock.start} – {nextBlock.end}</span>
        </div>
      )}

      {/* Day timeline */}
      {todayPlan.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">HOY</p>
          <div className="space-y-0.5">
            {todayPlan.map((block, i) => {
              const blockEnd = timeToMinutes(block.end);
              const blockStart = timeToMinutes(block.start);
              const isDone = blockEnd <= nowMin;
              const isActive = currentResult?.index === i;
              const isUpcoming = blockStart > nowMin;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-opacity ${
                    isDone ? "opacity-40" : isUpcoming ? "opacity-60" : "opacity-100"
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_STYLES[block.category]?.textColor || "hsl(var(--muted-foreground))" }}
                  />
                  <span className={`flex-1 truncate ${isDone ? "line-through" : ""} ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                    {block.activity}
                  </span>
                  <span className="text-muted-foreground tabular-nums text-[11px]">
                    {block.start} – {block.end}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {dayIndex > 4 && (
        <div className="text-center py-8">
          <p className="text-lg font-semibold text-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>Fin de semana</p>
          <p className="text-xs text-muted-foreground mt-1">No hay plan programado</p>
        </div>
      )}

      {/* Activity switcher */}
      <Sheet open={showSwitcher} onOpenChange={setShowSwitcher}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh] overflow-y-auto">
          <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-4" />
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground text-center mb-4">¿QUÉ ESTÁS HACIENDO?</p>

          <div className="grid grid-cols-2 gap-2 mb-4">
            {ACTIVITY_OPTIONS.map(opt => (
              <CategoryBg
                key={opt.category}
                category={opt.category}
                selected={activeCategory === opt.category}
                className="rounded-xl p-3 cursor-pointer transition-all hover:shadow-sm"
              >
                <button onClick={() => handleStartActivity(opt.category)} className="w-full text-left">
                  <p className="text-sm font-semibold">{opt.label}</p>
                  {opt.motor && (
                    <p className="text-[10px] mt-0.5 opacity-70">
                      {CATEGORY_STYLES[opt.category]?.motorLabel}
                    </p>
                  )}
                </button>
              </CategoryBg>
            ))}
          </div>

          <div className="border-t border-border pt-3">
            {!showOutOfPlan ? (
              <button
                onClick={() => setShowOutOfPlan(true)}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                  <Plus className="h-3 w-3" />
                </div>
                <span className="text-sm">Fuera de plan</span>
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Doctor, emergencia, trámite…"
                  value={outOfPlanText}
                  onChange={(e) => setOutOfPlanText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleOutOfPlan()}
                  className="w-full px-3 py-2 rounded-lg bg-secondary text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  autoFocus
                />
                <button
                  onClick={handleOutOfPlan}
                  className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                >
                  Confirmar
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowSwitcher(false)}
            className="w-full text-center text-xs text-muted-foreground mt-4 py-2"
          >
            Cancelar
          </button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
