import { useState } from "react";
import { Plus, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateManualEntry } from "@/lib/hooks/useTimeEntries";
import { useProjects, useTasks } from "@/lib/hooks/useProjects";
import { useSetEntryTags } from "@/lib/hooks/useTags";
import { TagSelector } from "@/components/TagSelector";
import { toast } from "sonner";

export function ManualEntry() {
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showProjects, setShowProjects] = useState(false);
  const { data: projects } = useProjects();
  const { data: tasks } = useTasks(projectId);
  const createEntry = useCreateManualEntry();
  const setEntryTags = useSetEntryTags();

  const currentProject = projects?.find((p) => p.id === projectId);

  const handleSubmit = () => {
    if (!projectId || !startTime || !endTime) {
      toast.error("Completa proyecto, inicio y fin");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    createEntry.mutate(
      {
        projectId,
        taskId: taskId || undefined,
        description: description || undefined,
        startTime: `${today}T${startTime}:00`,
        endTime: `${today}T${endTime}:00`,
      },
      {
        onSuccess: (entry) => {
          if (selectedTags.length > 0) {
            setEntryTags.mutate({ entryId: entry.id, tagIds: selectedTags });
          }
          toast.success("Entrada registrada");
          setOpen(false);
          setDescription("");
          setStartTime("");
          setEndTime("");
          setSelectedTags([]);
        },
      }
    );
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm">Entrada manual</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl bg-card border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Entrada manual</h3>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <input
        type="text"
        placeholder="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />

      <div className="relative">
        <button
          onClick={() => setShowProjects(!showProjects)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {currentProject && (
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentProject.color }} />
          )}
          <span>{currentProject?.name || "Seleccionar proyecto"}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>

        {showProjects && (
          <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg py-1 z-20 min-w-[200px]">
            {projects?.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setProjectId(p.id);
                  setTaskId("");
                  setShowProjects(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 hover:bg-secondary transition-colors ${
                  projectId === p.id ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {tasks && tasks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => setTaskId(taskId === t.id ? "" : t.id)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                taskId === t.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      <TagSelector selected={selectedTags} onChange={setSelectedTags} />

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Inicio</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground mb-1 block">Fin</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full bg-secondary rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <Button className="w-full" onClick={handleSubmit}>
        Registrar entrada
      </Button>
    </div>
  );
}
