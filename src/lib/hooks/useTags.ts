import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, color }: { name: string; color?: string }) => {
      const { data, error } = await supabase
        .from("tags")
        .insert({ name, ...(color ? { color } : {}) })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}

export function useDeleteTag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tags").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tags"] }),
  });
}

export function useEntryTags(entryId?: string) {
  return useQuery({
    queryKey: ["entry_tags", entryId],
    enabled: !!entryId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_entry_tags")
        .select("*, tags(*)")
        .eq("time_entry_id", entryId!);
      if (error) throw error;
      return data;
    },
  });
}

export function useSetEntryTags() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ entryId, tagIds }: { entryId: string; tagIds: string[] }) => {
      // Remove existing
      await supabase.from("time_entry_tags").delete().eq("time_entry_id", entryId);
      // Insert new
      if (tagIds.length > 0) {
        const { error } = await supabase.from("time_entry_tags").insert(
          tagIds.map((tag_id) => ({ time_entry_id: entryId, tag_id }))
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entry_tags"] });
      qc.invalidateQueries({ queryKey: ["time_entries_with_tags"] });
    },
  });
}
