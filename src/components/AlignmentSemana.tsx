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
import { InfoTooltip } from "./alignment/InfoTooltip";
import { SessionsPerDayChart } from "./alignment/SessionsPerDayChart";
import { WeeklyTrendChart } from "./alignment/WeeklyTrendChart";
import { MotorAlert } from "./alignment/MotorAlert";

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

function getDescriptivePhrase(pct: number): { text: string; color: string } {
  if (pct >= 90) return { text: "Casi perfecto", color: "#4A9A5A" };
  if (pct >= 75) return { text: "Buen ritmo", color: "#7AAA5A" };
  if (pct >= 50) return { text: "Semana irregular", color: "hsl(var(--primary))" };
  if (pct >= 25) return { text: "Semana difícil", color: "#A0724E" };
  return { text: "Hay que arrancar", color: "hsl(var(--muted-foreground))" };
}

/** Get motor categories from weekly plan */
function getMotorCategories(): Set<string> {
  const cats = new Set<string>();
  for (const day of WEEKLY_PLAN) {
    for (const block of day) {
      if (block.motor) cats.add(block.category);
    }
  }
  return cats;
}

/** Count planned motor sessions per day (distinct motor blocks) */
function getPlannedSessionsPerDay(): number[] {
  const motorCats = getMotorCategories();
  return WEEKLY_PLAN.slice(0, 5).map(day =>
    day.filter(b => motorCats.has(b.category)).length
  );
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

  // 4-week trend data
  const { data: trendEntries } = useQuery({
    queryKey: ["alignment_trend_4w", weekDates[0]],
    queryFn: async () => {
      const week0Dates = getWeekDatesForOffset(-3);
      const startUTC = nzMidnightToUTC(week0Dates[0]);
      const endDate = new Date(new Date(weekDates[6] + "T12:00:00").getTime());
      endDate.setDate(endDate.getDate() + 1);
      const endDateStr = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}`;
      const endUTC = nzMidnightToUTC(endDateStr);
      const { data, error } = await supabase
        .from("time_entries")
        .select("start_time, projects(name)")
        .gte("start_time", startUTC)
        .lt("start_time", endUTC)
        .eq("is_running", false);
      if (error) throw error;
      return data;
    },
  });

  const motorProjects = useMemo(() => {
    if (!projects) return [];
    return projects
      .filter(p => p.motor_number != null)
      .sort((a, b) => (a.motor_number || 0) - (b.motor_number || 0));
  }, [projects]);

  const motorProjectIds = useMemo(() => new Set(motorProjects.map(p => p.id)), [motorProjects]);

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (!projects) return map;
    for (const p of projects) {
      const cat = getProjectCategory(p.name);
      if (cat) map[cat] = p.color;
    }
    return map;
  }, [projects]);

  // --- HERO METRICS ---
  const plannedSessionsPerDay = useMemo(() => getPlannedSessionsPerDay(), []);
  const totalPlannedSessions = useMemo(() => plannedSessionsPerDay.reduce((s, v) => s + v, 0), [plannedSessionsPerDay]);

  const actualSessionsPerDay = useMemo(() => {
    if (!weekEntries) return [0, 0, 0, 0, 0];
    return weekDates.slice(0, 5).map(date => {
      const dayEntries = weekEntries.filter(e => toNZDate(e.start_time) === date);
      return dayEntries.filter(e => motorProjectIds.has(e.project_id)).length;
    });
  }, [weekEntries, weekDates, motorProjectIds]);

  const totalActualSessions = useMemo(() => actualSessionsPerDay.reduce((s, v) => s + v, 0), [actualSessionsPerDay]);
  const sessionsPct = totalPlannedSessions > 0 ? Math.round((totalActualSessions / totalPlannedSessions) * 100) : 0;

  // Time covered
  const { totalPlannedMin, totalActualMin } = useMemo(() => {
    if (!weekEntries || motorProjects.length === 0) return { totalPlannedMin: 0, totalActualMin: 0 };
    let plannedMin = 0;
    let actualMin = 0;
    for (const mp of motorProjects) {
      const cat = getProjectCategory(mp.name);
      if (cat) {
        for (let d = 0; d < 5; d++) plannedMin += getPlannedMinutesForDay(d, cat);
      }
      actualMin += weekEntries
        .filter(e => e.project_id === mp.id)
        .reduce((s, e) => s + (e.duration_seconds || 0), 0) / 60;
    }
    return { totalPlannedMin: plannedMin, totalActualMin: Math.round(actualMin) };
  }, [weekEntries, motorProjects]);

  const timePct = totalPlannedMin > 0 ? Math.round((totalActualMin / totalPlannedMin) * 100) : 0;
  const sessionsPhrase = getDescriptivePhrase(sessionsPct);
  const timePhrase = getDescriptivePhrase(timePct);

  // --- DAY ALIGNMENTS (for week grid) ---
  const dayAlignments = useMemo(() => {
    if (!weekEntries || motorProjects.length === 0) return [];
    return weekDates.slice(0, 5).map((date, dayIndex) => {
      const dayEntries = weekEntries.filter(e => toNZDate(e.start_time) === date);
      let totalPlanned = 0;
      let totalMatch = 0;
      for (const mp of motorProjects) {
        const cat = getProjectCategory(mp.name);
        const plannedMin = cat ? getPlannedMinutesForDay(dayIndex, cat) : 0;
        const actualSec = dayEntries.filter(e => e.project_id === mp.id).reduce((s, e) => s + (e.duration_seconds || 0), 0);
        totalPlanned += plannedMin;
        totalMatch += Math.min(plannedMin, actualSec / 60);
      }
      const pct = totalPlanned > 0 ? Math.round((totalMatch / totalPlanned) * 100) : 0;
      return { date, dayIndex, pct, hasData: dayEntries.length > 0 };
    });
  }, [weekEntries, weekDates, motorProjects]);

  // --- MOTOR DATA ---
  const motorData = useMemo(() => {
    if (!weekEntries || motorProjects.length === 0) return [];
    return motorProjects.map(mp => {
      const actualSec = weekEntries.filter(e => e.project_id === mp.id).reduce((s, e) => s + (e.duration_seconds || 0), 0);
      const actualHours = +(actualSec / 3600).toFixed(1);
      const cat = getProjectCategory(mp.name);
      let plannedMin = 0;
      if (cat) { for (let d = 0; d < 5; d++) plannedMin += getPlannedMinutesForDay(d, cat); }
      const goalHours = (mp.weekly_goal_hours as number) || 0;
      const pct = goalHours > 0 ? Math.min((actualHours / goalHours) * 100, 100) : 0;
      return {
        motor: mp.motor_number,
        label: `${mp.motor_number} · ${mp.name}`,
        actualHours, plannedHours: +(plannedMin / 60).toFixed(1), goalHours, pct,
        color: mp.color,
        lightBg: `${mp.color}15`,
      };
    }).filter(m => m.actualHours > 0 || m.goalHours > 0);
  }, [weekEntries, motorProjects]);

  // --- WEEKLY TREND ---
  const weeklyTrend = useMemo(() => {
    if (!trendEntries || !projects) return [];
    const motorNames = new Set(motorProjects.map(p => p.name.toLowerCase()));
    const weeks = [];
    for (let offset = -3; offset <= 0; offset++) {
      const wDates = getWeekDatesForOffset(offset);
      const weekStart = wDates[0];
      const weekEnd = wDates[6];
      const sessions = trendEntries.filter(e => {
        const d = toNZDate(e.start_time);
        const pName = (e.projects as any)?.name?.toLowerCase();
        return d >= weekStart && d <= weekEnd && pName && motorNames.has(pName);
      }).length;
      weeks.push({
        label: offset === 0 ? "Esta sem" : `Sem ${4 + offset}`,
        sessions,
        isCurrent: offset === 0,
      });
    }
    return weeks;
  }, [trendEntries, motorProjects, projects]);

  // --- DAY DETAIL ---
  const dayDetail = useMemo(() => {
    if (selectedDay === null || !weekEntries) return null;
    const date = weekDates[selectedDay];
    const dayEntries = weekEntries.filter(e => toNZDate(e.start_time) === date);
    const plan = selectedDay < 5 ? WEEKLY_PLAN[selectedDay] : [];
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
      if (actualMin > 0) matchStatus = Math.abs(actualMin - plannedMin) <= 20 ? "match" : "partial";
      const fallbackStyle = CATEGORY_STYLES[block.category];
      const dbColor = categoryColorMap[block.category];
      const resolvedStyle = {
        textColor: dbColor || fallbackStyle?.textColor,
        lightBg: dbColor ? `${dbColor}15` : fallbackStyle?.lightBg,
        darkBg: dbColor ? `${dbColor}20` : fallbackStyle?.darkBg,
      };
      return { block, actualMin: Math.round(actualMin), plannedMin, matchStatus, style: resolvedStyle };
    });
  }, [selectedDay, weekEntries, weekDates, categoryColorMap]);

  const streakLabel = (streakData || 0) === 1 ? "1 día" : `${streakData || 0} días`;
  const dayAbbrs = ["Lun", "Mar", "Mié", "Jue", "Vie"];

  return (
    <div className="space-y-2.5">
      {/* 1. TWO HERO METRICS */}
      <div className="grid grid-cols-2 gap-4 py-4">
        {/* Sessions */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-6xl tabular-nums" style={{ color: "hsl(var(--primary))", fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
              {totalActualSessions}
            </span>
            <span className="text-2xl text-muted-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>/{totalPlannedSessions}</span>
          </div>
          <p className="text-xs font-medium mt-1" style={{ color: sessionsPhrase.color }}>{sessionsPhrase.text}</p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <p className="text-[11px] text-muted-foreground">sesiones de motor</p>
            <InfoTooltip text={`Tenías ${totalPlannedSessions} bloques de motor planificados esta semana. Arrancaste ${totalActualSessions}.`} />
          </div>
        </div>

        {/* Time covered */}
        <div className="text-center">
          <div className="flex items-baseline justify-center gap-0.5">
            <span className="text-6xl tabular-nums" style={{ color: "hsl(var(--primary))", fontFamily: "'DM Serif Display', serif", fontWeight: 400 }}>
              {timePct}
            </span>
            <span className="text-2xl text-muted-foreground" style={{ fontFamily: "'DM Serif Display', serif" }}>%</span>
          </div>
          <p className="text-xs font-medium mt-1" style={{ color: timePhrase.color }}>{timePhrase.text}</p>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <p className="text-[11px] text-muted-foreground">tiempo cubierto</p>
            <InfoTooltip text={`Planificaste ${(totalPlannedMin / 60).toFixed(1)}h en motores. Registraste ${(totalActualMin / 60).toFixed(1)}h. Eso es un ${timePct}%.`} />
          </div>
        </div>
      </div>

      {/* Streak badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs">
          <Flame className="h-3 w-3" />
          <span>{streakLabel} · racha</span>
        </div>
      </div>

      {/* 2. WEEK GRID */}
      <div className="grid grid-cols-5 gap-1.5">
        {dayAlignments.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(selectedDay === i ? null : i)}
            className={`rounded-xl p-2 text-center transition-all border ${
              selectedDay === i ? "border-primary bg-primary/10" : "border-border bg-card"
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

      {/* 3+4. CHARTS SIDE BY SIDE */}
      <div className="grid grid-cols-2 gap-2.5">
        <SessionsPerDayChart planned={plannedSessionsPerDay} actual={actualSessionsPerDay} todayDayIndex={todayDayIndex} />
        {weeklyTrend.length > 0 && <WeeklyTrendChart weeks={weeklyTrend} />}
      </div>

      {/* 5. MOTOR NEGLECTED ALERT */}
      <MotorAlert motors={motorData.map(m => ({ label: m.label, actualHours: m.actualHours, goalHours: m.goalHours, pct: m.pct }))} />

      {/* 6. MOTOR PROGRESS BARS */}
      {motorData.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-3">
          <h3 className="text-xs font-semibold mb-3">Por motor</h3>
          <div className="space-y-3">
            {motorData.map(m => (
              <div key={m.motor}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-medium">{m.label}</span>
                  <span className="text-[13px] text-muted-foreground tabular-nums">
                    {m.actualHours}h / {m.goalHours}h · {Math.round(m.pct)}%
                  </span>
                </div>
                <div className="h-1.5 rounded-sm overflow-hidden" style={{ backgroundColor: m.lightBg }}>
                  <div className="h-full rounded-sm transition-all" style={{ width: `${m.pct}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. DAY DETAIL */}
      {selectedDay !== null && dayDetail && (
        <div className="rounded-xl bg-card border border-border p-3">
          <h3 className="text-xs font-semibold mb-3">{getDayName(selectedDay)} — bloque a bloque</h3>
          <div className="space-y-2">
            {dayDetail.map((item, i) => (
              <div key={i} className="flex items-stretch gap-2">
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
                <div className="flex items-center justify-center w-6">
                  {item.matchStatus === "match" ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : item.matchStatus === "partial" ? (
                    <Minus className="h-3.5 w-3.5 text-yellow-500" />
                  ) : (
                    <XIcon className="h-3.5 w-3.5 text-destructive" />
                  )}
                </div>
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
