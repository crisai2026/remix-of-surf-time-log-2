import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProjects } from "@/lib/hooks/useProjects";
import { useUpdateEntry } from "@/lib/hooks/useTimeEntries";
import { toast } from "sonner";

interface EditEntryDialogProps {
  entry: {
    id: string;
    description?: string | null;
    project_id: string;
    start_time: string;
    end_time?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditEntryDialog({ entry, open, onOpenChange }: EditEntryDialogProps) {
  const { data: projects } = useProjects();
  const updateEntry = useUpdateEntry();

  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (entry) {
      setDescription(entry.description || "");
      setProjectId(entry.project_id);
      setStartTime(formatDatetimeLocal(entry.start_time));
      setEndTime(entry.end_time ? formatDatetimeLocal(entry.end_time) : "");
    }
  }, [entry]);

  function formatDatetimeLocal(iso: string) {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const handleSave = () => {
    if (!entry) return;
    const updates: any = {
      id: entry.id,
      description: description || null,
      project_id: projectId,
    };
    if (startTime) updates.start_time = new Date(startTime).toISOString();
    if (endTime) updates.end_time = new Date(endTime).toISOString();

    updateEntry.mutate(updates, {
      onSuccess: () => {
        toast.success("Entrada actualizada");
        onOpenChange(false);
      },
      onError: () => toast.error("Error al actualizar"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm">Editar entrada</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Sin descripción"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Proyecto</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Inicio</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full mt-1 px-2 py-2 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Fin</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full mt-1 px-2 py-2 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={updateEntry.isPending}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {updateEntry.isPending ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
