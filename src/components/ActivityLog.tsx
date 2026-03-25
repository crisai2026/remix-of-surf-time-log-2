import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toNZDate, nzMidnightToUTC, todayISO, getWeekDates, formatTime, formatDuration } from "@/lib/formatTime";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Pencil, Trash2 } from "lucide-react";
import { useDeleteEntry } from "@/lib/hooks/useTimeEntries";
import { EditEntryDialog } from "@/components/EditEntryDialog";
import { toast } from "sonner";
import { useAppContext } from "@/contexts/AppContext";
import { DEMO_PROJECTS, DEMO_WEEK_ENTRIES } from "@/lib/demoData";

type TimePeriod = "today" | "week" | "month" | "all";

function getDateRange(period: TimePeriod): { gte?: string; lt?: string } {
  if (period === "all") return {};

  if (period === "today") {
    const today = todayISO();
    const [y, m, d] = today.split("-").map(Number);
    const tomorrow = new Date(y, m - 1, d + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    return { gte: nzMidnightToUTC(today), lt: nzMidnightToUTC(tomorrowStr) };
  }

  if (period === "week") {
    const weekDates = getWeekDates();
    const lastDay = weekDates[6];
    const [y, m, d] = lastDay.split("-").map(Number);
    const dayAfter = new Date(y, m - 1, d + 1);
    const dayAfterStr = `${dayAfter.getFullYear()}-${String(dayAfter.getMonth() + 1).padStart(2, "0")}-${String(dayAfter.getDate()).padStart(2, "0")}`;
    return { gte: nzMidnightToUTC(weekDates[0]), lt: nzMidnightToUTC(dayAfterStr) };
  }

  // month
  const today = todayISO();
  const [y, m] = today.split("-").map(Number);
  const firstDay = `${y}-${String(m).padStart(2, "0")}-01`;
  const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
  return { gte: nzMidnightToUTC(firstDay), lt: nzMidnightToUTC(nextMonth) };
}

function formatDayHeader(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const formatted = date.toLocaleDateString("en-NZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Pacific/Auckland",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function ActivityLog() {
  const [period, setPeriod] = useState<TimePeriod>("week");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editEntry, setEditEntry] = useState<any>(null);
  const deleteEntry = useDeleteEntry();

  const range = useMemo(() => getDateRange(period), [period]);

  const { mode } = useAppContext();
  const isDemo = mode === "demo";

  const { data: projects } = useQuery({
    queryKey: ["projects", mode],
    queryFn: async () => {
      if (isDemo) return DEMO_PROJECTS;
      const { data } = await supabase.from("projects").select("*").order("sort_order");
      return data || [];
    },
  });

  const { data: entries, isLoading } = useQuery({
    queryKey: ["log-entries", period, mode],
    queryFn: async () => {
      if (isDemo) return DEMO_WEEK_ENTRIES;
      let query = supabase
        .from("time_entries")
        .select("*, projects(*)")
        .eq("is_running", false)
        .order("start_time", { ascending: false });

      if (range.gte) query = query.gte("start_time", range.gte);
      if (range.lt) query = query.lt("start_time", range.lt);

      const { data } = await query;
      return data || [];
    },
  });

  const filteredEntries = useMemo(() => {
    if (!entries) return [];
    if (categoryFilter === "all") return entries;
    return entries.filter((e) => e.project_id === categoryFilter);
  }, [entries, categoryFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredEntries> = {};
    for (const entry of filteredEntries) {
      const day = toNZDate(entry.start_time);
      if (!groups[day]) groups[day] = [];
      groups[day].push(entry);
    }
    // Sort days reverse chronological, entries within each day ascending
    const sortedDays = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedDays.map((day) => ({
      day,
      entries: groups[day].sort((a, b) => a.start_time.localeCompare(b.start_time)),
    }));
  }, [filteredEntries]);

  const periodOptions: { value: TimePeriod; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "all", label: "All" },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex bg-secondary rounded-lg p-0.5">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-md transition-all ${
                period === opt.value
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="text-xs">All</span>
            </SelectItem>
            {projects?.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <span className="flex items-center gap-2 text-xs">
                  <span
                    className="inline-block h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  {p.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground text-sm">Loading…</div>
      ) : grouped.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No entries</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(({ day, entries: dayEntries }) => {
            const totalSeconds = dayEntries.reduce((sum, e) => sum + (e.duration_seconds || 0), 0);
            return (
              <div key={day}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">{formatDayHeader(day)}</h3>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatDuration(totalSeconds)}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {dayEntries.map((entry) => {
                    const project = entry.projects as any;
                    const projectName = project?.name || "No project";
                    const projectColor = project?.color || "hsl(var(--muted))";
                    const timeRange = `${formatTime(entry.start_time)}${entry.end_time ? ` – ${formatTime(entry.end_time)}` : ""}`;
                    const duration = entry.duration_seconds ? formatDuration(entry.duration_seconds) : "";
                    const showPlannedMismatch =
                      entry.planned_category && entry.planned_category !== projectName;

                    return (
                      <div
                        key={entry.id}
                        className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2 group"
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: projectColor }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-medium truncate">{projectName}</span>
                            {entry.is_out_of_plan && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 shrink-0">
                                off plan
                              </Badge>
                            )}
                          </div>
                          {showPlannedMismatch && (
                            <span className="text-[10px] text-muted-foreground">
                              plan: {entry.planned_category}
                            </span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs text-muted-foreground">{timeRange}</div>
                          {duration && (
                            <div className="text-xs font-medium tabular-nums">{duration}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditEntry(entry)}
                            className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this entry?")) {
                                deleteEntry.mutate(entry.id, {
                                  onSuccess: () => toast.success("Entry deleted"),
                                  onError: () => toast.error("Error deleting"),
                                });
                              }
                            }}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <EditEntryDialog
        entry={editEntry}
        open={!!editEntry}
        onOpenChange={(open) => { if (!open) setEditEntry(null); }}
      />
    </div>
  );
}
