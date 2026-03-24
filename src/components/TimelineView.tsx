import { useState } from "react";
import { useTimeEntries, useDeleteEntry } from "@/lib/hooks/useTimeEntries";
import { formatDuration, formatTime, todayISO } from "@/lib/formatTime";
import { Trash2, Clock, Pencil } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EditEntryDialog } from "@/components/EditEntryDialog";

function useEntryTagsMap(entryIds: string[]) {
  return useQuery({
    queryKey: ["entry_tags_map", entryIds],
    enabled: entryIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entry_tags")
        .select("*, tags(*)")
        .in("time_entry_id", entryIds);
      if (error) throw error;
      const map: Record<string, any[]> = {};
      data?.forEach((et) => {
        if (!map[et.time_entry_id]) map[et.time_entry_id] = [];
        map[et.time_entry_id].push(et.tags);
      });
      return map;
    },
  });
}

export function TimelineView() {
  const today = todayISO();
  const { data: entries, isLoading } = useTimeEntries(today);
  const deleteEntry = useDeleteEntry();
  const [editEntry, setEditEntry] = useState<any>(null);

  const entryIds = entries?.map((e) => e.id) || [];
  const { data: tagsMap } = useEntryTagsMap(entryIds);

  const totalSeconds =
    entries?.reduce((sum, e) => {
      if (e.is_running) {
        return sum + Math.floor((Date.now() - new Date(e.start_time).getTime()) / 1000);
      }
      return sum + (e.duration_seconds || 0);
    }, 0) || 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-secondary rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Today</h2>
        <span className="text-sm text-muted-foreground flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {formatDuration(totalSeconds)}
        </span>
      </div>

      {!entries || entries.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No entries today</p>
          <p className="text-xs mt-1">Start the timer or add a manual entry</p>
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry) => {
            const project = entry.projects as any;
            const task = entry.tasks as any;
            const entryTags = tagsMap?.[entry.id] || [];
            const duration = entry.is_running
              ? Math.floor((Date.now() - new Date(entry.start_time).getTime()) / 1000)
              : entry.duration_seconds || 0;

            return (
              <div
                key={entry.id}
                className={`group flex items-center gap-3 px-3 py-3 rounded-lg transition-colors hover:bg-secondary/50 ${
                  entry.is_running ? "bg-primary/5" : ""
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: project?.color || "#888" }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground truncate">
                      {entry.description || task?.name || "No description"}
                    </span>
                    {entry.is_running && (
                      <span className="text-[10px] uppercase tracking-wider text-primary font-medium">
                        Running
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs text-muted-foreground">{project?.name}</span>
                    {task && <span className="text-xs text-muted-foreground">/ {task.name}</span>}
                    {entryTags.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground"
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm tabular-nums text-foreground">{formatDuration(duration)}</span>
                  <div className="text-[11px] text-muted-foreground">
                    {formatTime(entry.start_time)}
                    {entry.end_time && ` – ${formatTime(entry.end_time)}`}
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!entry.is_running && (
                    <button
                      onClick={() => setEditEntry(entry)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteEntry.mutate(entry.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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
