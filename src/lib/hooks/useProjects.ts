import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAppContext } from "@/contexts/AppContext";
import { DEMO_PROJECTS, DEMO_TASKS } from "@/lib/demoData";

export function useProjects() {
  const { mode } = useAppContext();
  return useQuery({
    queryKey: ["projects", mode],
    queryFn: async () => {
      if (mode === "demo") return DEMO_PROJECTS;
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      const { data, error } = await supabase
        .from("projects")
        .insert({ name, color })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: { id: string; name?: string; color?: string; weekly_goal_hours?: number; motor_number?: number | null }) => {
      const { error } = await supabase
        .from("projects")
        .update(fields)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useTasks(projectId?: string) {
  const { mode } = useAppContext();
  return useQuery({
    queryKey: ["tasks", projectId, mode],
    queryFn: async () => {
      if (mode === "demo") return DEMO_TASKS.filter(t => !projectId || t.project_id === projectId);
      let q = supabase.from("tasks").select("*");
      if (projectId) q = q.eq("project_id", projectId);
      const { data, error } = await q.order("created_at");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, projectId }: { name: string; projectId: string }) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert({ name, project_id: projectId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
