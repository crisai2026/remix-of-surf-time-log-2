import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { nzMidnightToUTC } from "@/lib/formatTime";
import { useAppContext } from "@/contexts/AppContext";
import { DEMO_TIME_ENTRIES } from "@/lib/demoData";

export function useTimeEntries(date?: string) {
  const { mode } = useAppContext();
  return useQuery({
    queryKey: ["time_entries", date, mode],
    queryFn: async () => {
      if (mode === "demo") return DEMO_TIME_ENTRIES;
      let q = supabase
        .from("time_entries")
        .select("*, projects(*), tasks(*)")
        .order("start_time", { ascending: false });

      if (date) {
        const startUTC = nzMidnightToUTC(date);
        const nextDay = new Date(new Date(date + "T12:00:00").getTime());
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDateStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, "0")}-${String(nextDay.getDate()).padStart(2, "0")}`;
        const endUTC = nzMidnightToUTC(nextDateStr);
        q = q.gte("start_time", startUTC).lt("start_time", endUTC);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    refetchInterval: mode === "demo" ? false : 10000,
  });
}

export function useRunningEntry() {
  const { mode } = useAppContext();
  return useQuery({
    queryKey: ["running_entry", mode],
    queryFn: async () => {
      if (mode === "demo") return null;
      const { data, error } = await supabase
        .from("time_entries")
        .select("*, projects(*), tasks(*)")
        .eq("is_running", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    refetchInterval: mode === "demo" ? false : 1000,
  });
}

export function useStartTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, taskId, description, isOutOfPlan, plannedCategory }: {
      projectId: string;
      taskId?: string;
      description?: string;
      isOutOfPlan?: boolean;
      plannedCategory?: string;
    }) => {
      const { data: runningEntries } = await supabase
        .from("time_entries")
        .select("id, start_time, paused_seconds")
        .eq("is_running", true);

      if (runningEntries && runningEntries.length > 0) {
        for (const entry of runningEntries) {
          const duration = Math.floor((Date.now() - new Date(entry.start_time).getTime()) / 1000) - (entry.paused_seconds || 0);
          await supabase
            .from("time_entries")
            .update({ is_running: false, end_time: new Date().toISOString(), duration_seconds: Math.max(0, duration), paused_at: null })
            .eq("id", entry.id);
        }
      }

      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          project_id: projectId,
          task_id: taskId || null,
          description: description || null,
          start_time: new Date().toISOString(),
          is_running: true,
          is_out_of_plan: isOutOfPlan || false,
          planned_category: plannedCategory || null,
        })
        .select("*, projects(*), tasks(*)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["running_entry"] });
      qc.invalidateQueries({ queryKey: ["time_entries"] });
      qc.invalidateQueries({ queryKey: ["week_entries"] });
    },
  });
}

export function useStopTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: string) => {
      const { data: entry } = await supabase
        .from("time_entries")
        .select("start_time, paused_seconds")
        .eq("id", entryId)
        .single();

      if (!entry) throw new Error("Entry not found");

      const totalElapsed = Math.floor((Date.now() - new Date(entry.start_time).getTime()) / 1000);
      const duration = totalElapsed - (entry.paused_seconds || 0);

      const { data, error } = await supabase
        .from("time_entries")
        .update({
          is_running: false,
          end_time: new Date().toISOString(),
          duration_seconds: Math.max(0, duration),
          paused_at: null,
        })
        .eq("id", entryId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["running_entry"] });
      qc.invalidateQueries({ queryKey: ["time_entries"] });
      qc.invalidateQueries({ queryKey: ["week_entries"] });
    },
  });
}

export function usePauseTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: string) => {
      const { data, error } = await supabase
        .from("time_entries")
        .update({ paused_at: new Date().toISOString() })
        .eq("id", entryId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["running_entry"] });
    },
  });
}

export function useResumeTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entryId: string) => {
      const { data: entry } = await supabase
        .from("time_entries")
        .select("paused_at, paused_seconds")
        .eq("id", entryId)
        .single();

      if (!entry || !entry.paused_at) throw new Error("Entry not paused");

      const pausedDuration = Math.floor((Date.now() - new Date(entry.paused_at).getTime()) / 1000);
      const newPausedSeconds = (entry.paused_seconds || 0) + pausedDuration;

      const { data, error } = await supabase
        .from("time_entries")
        .update({ paused_at: null, paused_seconds: newPausedSeconds })
        .eq("id", entryId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["running_entry"] });
    },
  });
}

export function useUpdateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: {
      id: string;
      project_id?: string;
      task_id?: string | null;
      description?: string | null;
      start_time?: string;
      end_time?: string;
    }) => {
      const updates: any = { ...fields };
      if (fields.start_time && fields.end_time) {
        updates.duration_seconds = Math.floor(
          (new Date(fields.end_time).getTime() - new Date(fields.start_time).getTime()) / 1000
        );
      }
      const { data, error } = await supabase
        .from("time_entries")
        .update(updates)
        .eq("id", id)
        .select("*, projects(*), tasks(*)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["time_entries"] });
      qc.invalidateQueries({ queryKey: ["running_entry"] });
      qc.invalidateQueries({ queryKey: ["week_entries"] });
    },
  });
}

export function useCreateManualEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: {
      projectId: string;
      taskId?: string;
      description?: string;
      startTime: string;
      endTime: string;
    }) => {
      const duration = Math.floor(
        (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / 1000
      );
      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          project_id: entry.projectId,
          task_id: entry.taskId || null,
          description: entry.description || null,
          start_time: entry.startTime,
          end_time: entry.endTime,
          duration_seconds: duration,
          is_running: false,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["time_entries"] }),
  });
}

export function useDeleteEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("time_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["time_entries"] }),
  });
}
