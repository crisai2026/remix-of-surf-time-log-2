import { useState, useMemo } from "react";
import { useVisualTheme } from "@/hooks/useVisualTheme";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/lib/hooks/useProjects";
import { Flame, Check, Minus, X as XIcon } from "lucide-react";
import {
  WEEKLY_PLAN, CATEGORY_STYLES, CATEGORY_TO_PROJECT,
  getDayName, getPlannedMinutesForDay, timeToMinutes, type PlanBlock,
} from "@/lib/weeklyPlan";
import { getWeekDatesForOffset, toNZDate, todayISO, nzMidnightToUTC } from "@/lib/formatTime";

// Case-insensitive reverse lookup
function getProjectCategory(projectName: string): string | null {
  const lower = projectName.toLowerCase();
  for (const [cat, name] of Object.entries(CATEGORY_TO_PROJECT)) {
    if (name.toLowerCase() === lower) return cat;
  }
  return null;
}

function useDarkMode() {
  return document.documentElement.classList.contains("dark");
}

export function AlignmentSemana() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const dark = useDarkMode();
  const { data: projects } = useProjects();
  const { visualTheme } = useVisualTheme();

  const weekDates = useMemo(() => getWeekDatesForOffset(0), []);
  const todayStr = todayISO();

  const { data: weekEntries } = useQuery({
    queryKey: ["alignment_week_entries", weekDates[0]],
    queryFn: async () => {
      const startUTC = nzMidnightToUTC(weekDates[0]);
      const endDate = new Date(new Date(weekDates[6] + "T12:00:00").getTime());
      endDate.setDate(endDate.getDate() + 1);
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
      const endUTC = nzMidnightToUTC(endDateStr);
      const { data, error } = await supabase
        .from("time_entries")
        .select("*, projects(name, color)")
        .gte("start_time", startUTC)
        .lt("start_time", endUTC)
        .eq("is_running", false);
      if (error) throw error;
      return data;
    },
  });

  const { data: streakData } = useQuery({
    queryKey: ["alignment_streak"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("start_time")
        .eq("is_running", false)
        .order("start_time", { ascending: false })
        .limit(100);
      if (error) throw error;
      const uniqueDays = new Set(data?.map(e => toNZDate(e.start_time)));
      let streak = 0;
      const [y, m, d] = todayStr.split("-").map(Number);
      const base = new Date(y, m - 1, d);
      for (let i = 0; i < 60; i++) {
        const dt = new Date(base);
        dt.setDate(base.getDate() - i);
        const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
        if (uniqueDays.has(key)) streak++;
        else if (i > 0) break;
      }
      return streak;
    },
  });

  // Get motor projects from DB
  const motorProjects = useMemo(() => {
    if (!projects) return [];
    return projects
      .filter(p => p.motor_number != null)
      .sort((a, b) => (a.motor_number || 0) - (b.motor_number || 0));
  }, [projects]);

  // Build category → DB color lookup
  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!projects) return map;
    for (const p of projects) {
      const cat = getProjectCategory(p.name);
      if (cat) map[cat] = p.color;
    }
    return map;
  }, [projects]);

  // Calculate alignment per day using motor projects
  const dayAlignments = useMemo(() => {
    if (!weekEntries || motorProjects.length === 0) return [];

    return weekDates.slice(0, 5).map((date, dayIndex) => {
      const dayEntries = weekEntries.filter(e => toNZDate(e.start_time) === date);

      let totalPlanned = 0;
      let totalMatch = 0;

      for (const mp of motorProjects) {
        const cat = getProjectCategory(mp.name);
        const plannedMin = cat ? getPlannedMinutesForDay(dayIndex, cat) : 0;
        const actualSec = dayEntries
          .filter(e => e.project_id === mp.id)
          .reduce((s, e) => s + (e.duration_seconds || 0), 0);
        const actualMin = actualSec / 60;

        totalPlanned += plannedMin;
        totalMatch += Math.min(plannedMin, actualMin);
      }

      const pct = totalPlanned > 0 ? Math.round((totalMatch / totalPlanned) * 100) : 0;
      const hasData = dayEntries.length > 0;
      return { date, dayIndex, pct, hasData };
    });
  }, [weekEntries, weekDates, motorProjects]);

  const weekAlignment = useMemo(() => {
    const withData = dayAlignments.filter(d => d.hasData);
    if (withData.length === 0) return 0;
    return Math.round(withData.reduce((s, d) => s + d.pct, 0) / withData.length);
  }, [dayAlignments]);

  // Motor comparison — dynamic from DB
  const motorData = useMemo(() => {
    if (!weekEntries || motorProjects.length === 0) return [];
    return motorProjects.map(mp => {
      const actualSec = weekEntries
        .filter(e => e.project_id === mp.id)
        .reduce((s, e) => s + (e.duration_seconds || 0), 0);
      const actualHours = +(actualSec / 3600).toFixed(1);

      const cat = getProjectCategory(mp.name);
      let plannedMin = 0;
      if (cat) {
        for (let d = 0; d < 5; d++) {
          plannedMin += getPlannedMinutesForDay(d, cat);
        }
      }
      const plannedHours = +(plannedMin / 60).toFixed(1);
      const goalHours = (mp.weekly_goal_hours as number) || 0;

      return {
        motor: mp.motor_number,
        label: `${mp.motor_number} · ${mp.name}`,
        actualHours,
        plannedHours,
        goalHours,
        pct: goalHours > 0 ? Math.min((actualHours / goalHours) * 100, 100) : 0,
        color: mp.color,
        lightBg: `${mp.color}15`,
        darkBg: `${mp.color}20`,
      };
    });
  }, [weekEntries, motorProjects]);

  // Day detail
  const dayDetail = useMemo(() => {
    if (selectedDay === null || !weekEntries) return null;
    const date = weekDates[selectedDay];
    const dayEntries = weekEntries.filter(e => toNZDate(e.start_time) === date);
    const plan = selectedDay < 5 ? WEEKLY_PLAN[selectedDay] : [];

    // Only non-routine blocks
    const blocks = plan.filter(b => !["rutina", "buffer"].includes(b.category));

    return blocks.map(block => {
      const projectName = CATEGORY_TO_PROJECT[block.category];
      const matching = dayEntries.filter(e => {
        const eName = (e.projects as any)?.name;
        return eName && projectName && eName.toLowerCase() === projectName.toLowerCase();
      });
      const actualSec = matching.reduce((s, e) => s + (e.duration_seconds || 0), 0);
      const actualMin = actualSec / 60;
      const plannedMin = timeToMinutes(block.end) - timeToMinutes(block.start);

      let matchStatus: "match" | "partial" | "miss" = "miss";
      if (actualMin > 0) {
        matchStatus = Math.abs(actualMin - plannedMin) <= 20 ? "match" : "partial";
      }

      const fallbackStyle = CATEGORY_STYLES[block.category];
      const dbColor = categoryColorMap[block.category];
      const resolvedStyle = {
        textColor: dbColor || fallbackStyle?.textColor,
        lightBg: dbColor ? `${dbColor}15` : fallbackStyle?.lightBg,
        darkBg: dbColor ? `${dbColor}20` : fallbackStyle?.darkBg,
      };
      return {
        block,
        actualMin: Math.round(actualMin),
        plannedMin,
        matchStatus,
        style: resolvedStyle,
      };
    });
  }, [selectedDay, weekEntries, weekDates]);

  const streakLabel = (streakData || 0) === 1 ? "1 día" : `${streakData || 0} días`;
  const dayAbbrs = ["Lun", "Mar", "Mié", "Jue", "Vie"];

  return (
    <div className="space-y-4">
      {/* Alignment hero */}
      <div className="text-center py-4">
        <div className="flex items-baseline justify-center gap-1">
          <span
            className="text-6xl tabular-nums"
            style={{ color: "hsl(var(--primary))", fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}
          >
            {weekAlignment}
          </span>
          <span className="text-2xl text-muted-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">alineación esta semana</p>
        <p className="text-[10px] text-muted-foreground">plan vs realidad</p>

        <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
          <Flame className="h-3 w-3" />
          <span>{streakLabel} · racha</span>
        </div>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {dayAlignments.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(selectedDay === i ? null : i)}
            className={`rounded-xl p-2 text-center transition-all border ${
              selectedDay === i
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            }`}
          >
            <p className="text-[10px] text-muted-foreground">
              {dayAbbrs[i]}
              {(visualTheme === "nostromo" || visualTheme === "matrix") && weekDates[i] === todayStr && (
                <span className="animate-blink ml-0.5">█</span>
              )}
            </p>
            <p className="text-sm font-semibold tabular-nums">{d.hasData ? `${d.pct}%` : "—"}</p>
          </button>
        ))}
      </div>

      {/* Motor comparison bars */}
      <div className="rounded-xl bg-card border border-border p-3">
        <h3 className="text-xs font-semibold mb-3">Por motor — plan vs real</h3>
        <div className="space-y-3">
          {motorData.map(m => {
            const maxH = Math.max(m.plannedHours, m.actualHours, 0.1);
            return (
              <div key={m.motor}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{m.label}</span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {m.actualHours}h / {m.plannedHours}h plan
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all opacity-30"
                      style={{ width: `${(m.plannedHours / maxH) * 100}%`, backgroundColor: m.color }}
                    />
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(m.actualHours / maxH) * 100}%`, backgroundColor: m.color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Motor summary cards */}
      <div className="grid grid-cols-3 gap-2">
        {motorData.map(m => (
          <div key={m.motor} className="rounded-xl border border-border p-2.5 text-center" style={{ backgroundColor: dark ? m.darkBg : m.lightBg }}>
            <p className="text-[10px] font-medium truncate" style={{ color: m.color }}>{m.label}</p>
            <p className="text-sm font-semibold tabular-nums mt-0.5" style={{ color: m.color }}>
              {m.actualHours}h
              <span className="text-[10px] font-normal opacity-60">/{m.goalHours}h</span>
            </p>
            <div className="h-1 rounded-full bg-secondary/50 overflow-hidden mt-1.5">
              <div className="h-full rounded-full transition-all" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Day detail */}
      {selectedDay !== null && dayDetail && (
        <div className="rounded-xl bg-card border border-border p-3">
          <h3 className="text-xs font-semibold mb-3">{getDayName(selectedDay)} — bloque a bloque</h3>
          <div className="space-y-2">
            {dayDetail.map((item, i) => (
              <div key={i} className="flex items-stretch gap-2">
                {/* Plan */}
                <div
                  className="flex-1 rounded-lg p-2 border border-dashed opacity-60"
                  style={{
                    borderColor: item.style?.textColor || "hsl(var(--border))",
                    backgroundColor: dark ? item.style?.darkBg : item.style?.lightBg,
                  }}
                >
                  <p className="text-[11px] font-medium" style={{ color: item.style?.textColor }}>{item.block.activity}</p>
                  <p className="text-[10px] opacity-70" style={{ color: item.style?.textColor }}>
                    {item.block.start} – {item.block.end} · {item.plannedMin}min
                  </p>
                </div>

                {/* Match indicator */}
                <div className="flex items-center justify-center w-6">
                  {item.matchStatus === "match" ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : item.matchStatus === "partial" ? (
                    <Minus className="h-3.5 w-3.5 text-yellow-500" />
                  ) : (
                    <XIcon className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>

                {/* Real */}
                <div
                  className="flex-1 rounded-lg p-2 border"
                  style={{
                    borderColor: item.actualMin > 0 ? (item.style?.textColor || "hsl(var(--border))") : "hsl(var(--border))",
                    backgroundColor: item.actualMin > 0 ? (dark ? item.style?.darkBg : item.style?.lightBg) : "transparent",
                  }}
                >
                  {item.actualMin > 0 ? (
                    <>
                      <p className="text-[11px] font-medium" style={{ color: item.style?.textColor }}>{item.block.activity}</p>
                      <p className="text-[10px] opacity-70" style={{ color: item.style?.textColor }}>{item.actualMin}min</p>
                    </>
                  ) : (
                    <>
                      <p className="text-[11px] text-muted-foreground">—</p>
                      <p className="text-[10px] text-muted-foreground">no registrado</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
