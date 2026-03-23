import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTimeEntries(date?: string) {
  return useQuery({
    queryKey: ["time_entries", date],
    queryFn: async () => {
      let q = supabase
        .from("time_entries")
        .select("*, projects(*), tasks(*)")
        .order("start_time", { ascending: false });

      if (date) {
        const start = `${date}T00:00:00`;
        const end = `${date}T23:59:59`;
        q = q.gte("start_time", start).lte("start_time", end);
      }

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000, // refresh for running timers
  });
}

export function useRunningEntry() {
  return useQuery({
    queryKey: ["running_entry"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entries")
        .select("*, projects(*), tasks(*)")
        .eq("is_running", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    refetchInterval: 1000,
  });
}

export function useStartTimer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ projectId, taskId, description }: { projectId: string; taskId?: string; description?: string }) => {
      // Stop any running entry first
      await supabase
        .from("time_entries")
        .update({ is_running: false, end_time: new Date().toISOString(), duration_seconds: 0 })
        .eq("is_running", true);

      const { data, error } = await supabase
        .from("time_entries")
        .insert({
          project_id: projectId,
          task_id: taskId || null,
          description: description || null,
          start_time: new Date().toISOString(),
          is_running: true,
        })
        .select("*, projects(*), tasks(*)")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["running_entry"] });
      qc.invalidateQueries({ queryKey: ["time_entries"] });
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
      const duration = totalElapsed - ((entry as any).paused_seconds || 0);
      
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
      
      if (!entry || !(entry as any).paused_at) throw new Error("Entry not paused");
      
      const pausedDuration = Math.floor((Date.now() - new Date((entry as any).paused_at).getTime()) / 1000);
      const newPausedSeconds = ((entry as any).paused_seconds || 0) + pausedDuration;
      
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
