import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/lib/hooks/useProjects";
import { Flame, Check, Minus, X as XIcon } from "lucide-react";
import {
  WEEKLY_PLAN, CATEGORY_STYLES, CATEGORY_TO_PROJECT,
  getDayName, getPlannedMinutesForDay, timeToMinutes, type PlanBlock,
} from "@/lib/weeklyPlan";
import { getWeekDatesForOffset } from "@/lib/formatTime";

function useDarkMode() {
  return document.documentElement.classList.contains("dark");
}

export function AlignmentSemana() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const dark = useDarkMode();
  const { data: projects } = useProjects();

  const weekDates = useMemo(() => getWeekDatesForOffset(0), []);

  const { data: weekEntries } = useQuery({
    queryKey: ["alignment_week_entries", weekDates[0]],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*, projects(name, color)")
        .gte("start_time", `${weekDates[0]}T00:00:00`)
        .lte("start_time", `${weekDates[6]}T23:59:59`)
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
      const uniqueDays = new Set(data?.map(e => e.start_time.split("T")[0]));
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 60; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        if (uniqueDays.has(d.toISOString().split("T")[0])) streak++;
        else if (i > 0) break;
      }
      return streak;
    },
  });

  // Calculate alignment per day
  const dayAlignments = useMemo(() => {
    if (!weekEntries) return [];
    const motorCategories = ["jobhunt", "ai", "proyectos"];

    return weekDates.slice(0, 5).map((date, dayIndex) => {
      const dayEntries = weekEntries.filter(e => e.start_time.startsWith(date));

      let totalPlanned = 0;
      let totalMatch = 0;

      for (const cat of motorCategories) {
        const plannedMin = getPlannedMinutesForDay(dayIndex, cat);
        const projectName = CATEGORY_TO_PROJECT[cat];
        const actualSec = dayEntries
          .filter(e => (e.projects as any)?.name === projectName)
          .reduce((s, e) => s + (e.duration_seconds || 0), 0);
        const actualMin = actualSec / 60;

        totalPlanned += plannedMin;
        totalMatch += Math.min(plannedMin, actualMin);
      }

      const pct = totalPlanned > 0 ? Math.round((totalMatch / totalPlanned) * 100) : 0;
      const hasData = dayEntries.length > 0;
      return { date, dayIndex, pct, hasData };
    });
  }, [weekEntries, weekDates]);

  const weekAlignment = useMemo(() => {
    const withData = dayAlignments.filter(d => d.hasData);
    if (withData.length === 0) return 0;
    return Math.round(withData.reduce((s, d) => s + d.pct, 0) / withData.length);
  }, [dayAlignments]);

  // Motor comparison
  const motorData = useMemo(() => {
    if (!weekEntries) return [];
    return Object.entries(MOTOR_GOALS).map(([motorNum, info]) => {
      const projectName = CATEGORY_TO_PROJECT[info.category];
      const actualSec = weekEntries
        .filter(e => (e.projects as any)?.name === projectName)
        .reduce((s, e) => s + (e.duration_seconds || 0), 0);
      const actualHours = +(actualSec / 3600).toFixed(1);

      let plannedMin = 0;
      for (let d = 0; d < 5; d++) {
        plannedMin += getPlannedMinutesForDay(d, info.category);
      }
      const plannedHours = +(plannedMin / 60).toFixed(1);

      const style = CATEGORY_STYLES[info.category];
      return {
        motor: Number(motorNum),
        label: info.label,
        actualHours,
        plannedHours,
        goalHours: info.weeklyHours,
        pct: info.weeklyHours > 0 ? Math.min((actualHours / info.weeklyHours) * 100, 100) : 0,
        color: style?.textColor || "hsl(var(--primary))",
        lightBg: style?.lightBg || "hsl(var(--secondary))",
        darkBg: style?.darkBg || "hsl(var(--secondary))",
      };
    });
  }, [weekEntries]);

  // Day detail
  const dayDetail = useMemo(() => {
    if (selectedDay === null || !weekEntries) return null;
    const date = weekDates[selectedDay];
    const dayEntries = weekEntries.filter(e => e.start_time.startsWith(date));
    const plan = selectedDay < 5 ? WEEKLY_PLAN[selectedDay] : [];

    // Only non-routine blocks
    const blocks = plan.filter(b => !["rutina", "buffer"].includes(b.category));

    return blocks.map(block => {
      const projectName = CATEGORY_TO_PROJECT[block.category];
      const matching = dayEntries.filter(e => (e.projects as any)?.name === projectName);
      const actualSec = matching.reduce((s, e) => s + (e.duration_seconds || 0), 0);
      const actualMin = actualSec / 60;
      const plannedMin = timeToMinutes(block.end) - timeToMinutes(block.start);

      let matchStatus: "match" | "partial" | "miss" = "miss";
      if (actualMin > 0) {
        matchStatus = Math.abs(actualMin - plannedMin) <= 20 ? "match" : "partial";
      }

      const style = CATEGORY_STYLES[block.category];
      return {
        block,
        actualMin: Math.round(actualMin),
        plannedMin,
        matchStatus,
        style,
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
            <p className="text-[10px] text-muted-foreground">{dayAbbrs[i]}</p>
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
            <p className="text-[10px] font-medium truncate" style={{ color: m.color }}>{m.label.split(" · ")[0]}</p>
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
