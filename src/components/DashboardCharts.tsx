import { useState, useMemo } from "react";
import { EditEntryDialog } from "@/components/EditEntryDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/lib/hooks/useProjects";
import { formatDuration, getWeekDatesForOffset } from "@/lib/formatTime";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, CartesianGrid,
} from "recharts";
import { Flame, Clock, TrendingUp, ChevronLeft, ChevronRight, Activity, Pencil } from "lucide-react";

// Motors are now dynamic from DB (motor_number column on projects)

export function DashboardCharts() {
  const { data: projects } = useProjects();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editEntry, setEditEntry] = useState<any>(null);

  const weekDates = useMemo(() => getWeekDatesForOffset(weekOffset), [weekOffset]);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const { data: weekEntries } = useQuery({
    queryKey: ["week_entries", weekStart],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*, projects(*)")
        .gte("start_time", `${weekStart}T00:00:00`)
        .lte("start_time", `${weekEnd}T23:59:59`)
        .eq("is_running", false);
      if (error) throw error;
      return data;
    },
  });

  const { data: streakData } = useQuery({
    queryKey: ["streak"],
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
        const key = d.toISOString().split("T")[0];
        if (uniqueDays.has(key)) streak++;
        else if (i > 0) break;
      }
      return streak;
    },
  });

  const { data: heatmapEntries } = useQuery({
    queryKey: ["heatmap_entries"],
    queryFn: async () => {
      const from = new Date();
      from.setDate(from.getDate() - 84);
      const { data, error } = await supabase
        .from("time_entries")
        .select("start_time, duration_seconds, project_id, projects(name, color)")
        .gte("start_time", from.toISOString())
        .eq("is_running", false);
      if (error) throw error;
      return data;
    },
  });

  const projectData = useMemo(() =>
    projects?.map((p) => {
      const totalSec = weekEntries
        ?.filter((e) => e.project_id === p.id)
        .reduce((sum, e) => sum + (e.duration_seconds || 0), 0) || 0;
      return { name: p.name, id: p.id, hours: +(totalSec / 3600).toFixed(1), seconds: totalSec, color: p.color };
    }).filter(d => d.hours > 0).sort((a, b) => b.hours - a.hours) || [],
    [projects, weekEntries]
  );

  const dailyData = useMemo(() => weekDates.map((date) => {
    const dayEntries = weekEntries?.filter((e) => e.start_time.startsWith(date));
    const totalSec = dayEntries?.reduce((sum, e) => sum + (e.duration_seconds || 0), 0) || 0;
    const d = new Date(date + "T12:00:00");
    return {
      day: d.toLocaleDateString("es-CL", { weekday: "short" }),
      date,
      hours: +(totalSec / 3600).toFixed(1),
      isToday: date === new Date().toISOString().split("T")[0],
    };
  }), [weekDates, weekEntries]);

  const weekTotal = weekEntries?.reduce((s, e) => s + (e.duration_seconds || 0), 0) || 0;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayTotal = weekEntries
    ?.filter((e) => e.start_time.startsWith(todayStr))
    .reduce((s, e) => s + (e.duration_seconds || 0), 0) || 0;

  const daysWithData = weekDates.filter(d => weekEntries?.some(e => e.start_time.startsWith(d))).length;
  const avgDaily = daysWithData > 0 ? Math.round(weekTotal / daysWithData) : 0;

  const streakLabel = (streakData || 0) === 1 ? "1 día" : `${streakData || 0} días`;

  const fmt = (seconds: number) => {
    if (seconds === 0) return "—";
    return formatDuration(seconds);
  };

  // Motor + goal data — dynamic from DB
  const motorGoalData = useMemo(() => {
    if (!projects) return [];
    return projects
      .filter(p => (p as any).motor_number != null)
      .sort((a, b) => ((a as any).motor_number || 0) - ((b as any).motor_number || 0))
      .map(p => {
        const totalSec = weekEntries
          ?.filter(e => e.project_id === p.id)
          .reduce((s, e) => s + (e.duration_seconds || 0), 0) || 0;
        const hours = +(totalSec / 3600).toFixed(1);
        const goal = (p.weekly_goal_hours as number) || 0;
        const pct = goal > 0 ? Math.min((hours / goal) * 100, 100) : 0;
        return {
          label: `Motor ${(p as any).motor_number}`,
          projectName: p.name,
          hours,
          color: p.color,
          goal,
          pct,
        };
      });
  }, [projects, weekEntries]);

  // Heatmap grid
  const heatmapGrid = useMemo(() => {
    const weeks: { date: string; hours: number }[][] = [];
    const today = new Date();
    const startDay = new Date(today);
    const dow = (startDay.getDay() + 6) % 7;
    startDay.setDate(startDay.getDate() - dow - 77);

    const dayMap = new Map<string, number>();
    heatmapEntries?.forEach(e => {
      const day = e.start_time.split("T")[0];
      dayMap.set(day, (dayMap.get(day) || 0) + (e.duration_seconds || 0));
    });

    for (let w = 0; w < 12; w++) {
      const week: { date: string; hours: number }[] = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(startDay);
        dt.setDate(startDay.getDate() + w * 7 + d);
        const key = dt.toISOString().split("T")[0];
        week.push({ date: key, hours: +((dayMap.get(key) || 0) / 3600).toFixed(1) });
      }
      weeks.push(week);
    }
    return weeks;
  }, [heatmapEntries]);

  const maxHeatmapHours = useMemo(() => {
    let max = 0;
    heatmapGrid.forEach(w => w.forEach(d => { if (d.hours > max) max = d.hours; }));
    return max || 1;
  }, [heatmapGrid]);

  const selectedDayBreakdown = useMemo(() => {
    if (!selectedDay || !heatmapEntries) return [];
    const dayEntries = heatmapEntries.filter(e => e.start_time.startsWith(selectedDay));
    const byProject = new Map<string, { name: string; color: string; seconds: number }>();
    dayEntries.forEach(e => {
      const pid = e.project_id;
      const existing = byProject.get(pid);
      if (existing) {
        existing.seconds += e.duration_seconds || 0;
      } else {
        byProject.set(pid, {
          name: (e.projects as any)?.name || "Sin proyecto",
          color: (e.projects as any)?.color || "hsl(var(--primary))",
          seconds: e.duration_seconds || 0,
        });
      }
    });
    return Array.from(byProject.values()).sort((a, b) => b.seconds - a.seconds);
  }, [selectedDay, heatmapEntries]);

  // Today's entries
  const todayEntries = useMemo(() => {
    if (!weekEntries) return [];
    return weekEntries
      .filter(e => e.start_time.startsWith(todayStr))
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  }, [weekEntries, todayStr]);

  const weekLabel = (() => {
    const s = new Date(weekStart + "T12:00:00");
    const e = new Date(weekEnd + "T12:00:00");
    return `${s.toLocaleDateString("es-CL", { day: "numeric", month: "short" })} – ${e.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}`;
  })();

  return (
    <div className="space-y-3">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setWeekOffset(o => o - 1)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-medium text-foreground">{weekLabel}</span>
        <button
          onClick={() => setWeekOffset(o => Math.min(o + 1, 0))}
          disabled={weekOffset >= 0}
          className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Row 1 — Metrics */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={<Clock className="h-3.5 w-3.5 text-primary" />} label="Hoy" value={fmt(todayTotal)} />
        <StatCard icon={<TrendingUp className="h-3.5 w-3.5 text-primary" />} label="Semana" value={fmt(weekTotal)} />
        <StatCard icon={<Activity className="h-3.5 w-3.5 text-primary" />} label="Promedio" value={fmt(avgDaily)} />
        <StatCard icon={<Flame className="h-3.5 w-3.5 text-primary" />} label="Racha" value={streakLabel} />
      </div>

      {/* Row 2 — Motores + Goals merged */}
      {motorGoalData.length > 0 && (
        <div className="rounded-xl bg-card border border-border p-3">
          <h3 className="text-xs font-semibold mb-2">Motores</h3>
          <div className="space-y-2.5">
            {motorGoalData.map(m => (
              <div key={m.label}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="text-xs font-medium flex-1 truncate">{m.label}</span>
                  <span className="text-[10px] text-muted-foreground">{m.projectName}</span>
                  <span className="text-xs tabular-nums font-medium ml-1">
                    {m.hours > 0 ? `${m.hours}h` : "—"}
                    {m.goal > 0 && <span className="text-muted-foreground font-normal">/{m.goal}h</span>}
                  </span>
                </div>
                {m.goal > 0 && (
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden ml-4">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Row 3 — Two columns: Donut + Bar chart */}
      <div className="grid grid-cols-2 gap-3">
        {/* Donut */}
        <div className="rounded-xl bg-card border border-border p-3">
          <h3 className="text-xs font-semibold mb-2">Por proyecto</h3>
          {projectData.length > 0 ? (
            <>
              <div className="w-[100px] h-[100px] mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={projectData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} dataKey="hours" stroke="none">
                      {projectData.map((p, i) => <Cell key={i} fill={p.color} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}h`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))", fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 mt-2">
                {projectData.map(p => (
                  <div key={p.name} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    <span className="flex-1 truncate">{p.name}</span>
                    <span className="text-muted-foreground tabular-nums">{p.hours}h</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-[11px] text-muted-foreground text-center py-6">Sin datos</p>
          )}
        </div>

        {/* Bar chart */}
        <div className="rounded-xl bg-card border border-border p-3">
          <h3 className="text-xs font-semibold mb-2">Semana</h3>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis hide axisLine={false} tickLine={false} width={0} />
              <Tooltip formatter={(value: number) => [`${value}h`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))", fontSize: 11 }} />
              <Bar dataKey="hours" radius={[3, 3, 0, 0]}>
                {dailyData.map((entry, i) => (
                  <Cell key={i} fill="hsl(16, 65%, 60%)" opacity={entry.isToday ? 1 : 0.4} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4 — Heatmap */}
      <div className="rounded-xl bg-card border border-border p-3">
        <h3 className="text-xs font-semibold mb-2">Carga semanal</h3>
        <div className="flex gap-[3px] overflow-x-auto pb-1">
          <div className="flex flex-col gap-[3px] mr-1 shrink-0">
            {["L", "M", "X", "J", "V", "S", "D"].map(d => (
              <span key={d} className="text-[9px] text-muted-foreground h-[10px] flex items-center justify-end w-3">{d}</span>
            ))}
          </div>
          {heatmapGrid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => {
                const intensity = day.hours > 0 ? Math.max(0.15, day.hours / maxHeatmapHours) : 0;
                const isSelected = selectedDay === day.date;
                const isFuture = day.date > todayStr;
                return (
                  <button
                    key={day.date}
                    onClick={() => !isFuture && day.hours > 0 && setSelectedDay(selectedDay === day.date ? null : day.date)}
                    title={isFuture ? "" : `${day.date}: ${day.hours}h`}
                    disabled={isFuture}
                    className={`w-[10px] h-[10px] rounded-[2px] transition-all ${isSelected ? "ring-1 ring-primary ring-offset-1 ring-offset-card" : ""} ${isFuture ? "opacity-20" : day.hours > 0 ? "cursor-pointer" : ""}`}
                    style={{
                      backgroundColor: day.hours > 0
                        ? `hsl(16, 65%, ${60 - intensity * 25}%)`
                        : "hsl(var(--secondary))",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {selectedDay && selectedDayBreakdown.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground mb-2">
              {new Date(selectedDay + "T12:00:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <div className="flex h-4 rounded-full overflow-hidden">
              {selectedDayBreakdown.map((p, i) => {
                const total = selectedDayBreakdown.reduce((s, x) => s + x.seconds, 0);
                const pct = (p.seconds / total) * 100;
                return (
                  <div key={i} className="h-full" style={{ width: `${pct}%`, backgroundColor: p.color }} title={`${p.name}: ${formatDuration(p.seconds)}`} />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {selectedDayBreakdown.map((p, i) => (
                <div key={i} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.name}</span>
                  <span className="tabular-nums">{formatDuration(p.seconds)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Row 5 — Today's entries */}
      <div className="rounded-xl bg-card border border-border p-3">
        <h3 className="text-xs font-semibold mb-2">Hoy</h3>
        {todayEntries.length === 0 ? (
          <p className="text-[11px] text-muted-foreground text-center py-3">Sin entradas hoy</p>
        ) : (
          <div className="space-y-1">
            {todayEntries.map(e => (
              <div key={e.id} className="group flex items-center gap-2 text-[11px] py-1">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: (e.projects as any)?.color || "hsl(var(--primary))" }} />
                <span className="flex-1 truncate text-muted-foreground">{e.description || (e.projects as any)?.name || "Sin descripción"}</span>
                <span className="tabular-nums text-foreground">{formatDuration(e.duration_seconds || 0)}</span>
                <button
                  onClick={() => setEditEntry(e)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity"
                >
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditEntryDialog
        entry={editEntry}
        open={!!editEntry}
        onOpenChange={(open) => { if (!open) setEditEntry(null); }}
      />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card border border-border p-2.5 text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="text-sm font-semibold text-foreground">{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}
