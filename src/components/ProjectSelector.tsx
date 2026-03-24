import { useProjects, useTasks, useCreateTask } from "@/lib/hooks/useProjects";
import { useState } from "react";
import { Plus } from "lucide-react";

interface Props {
  selectedProject: string;
  selectedTask: string;
  onProjectChange: (id: string) => void;
  onTaskChange: (id: string) => void;
}

export function ProjectSelector({ selectedProject, selectedTask, onProjectChange, onTaskChange }: Props) {
  const { data: projects } = useProjects();
  const { data: tasks } = useTasks(selectedProject);
  const createTask = useCreateTask();
  const [newTask, setNewTask] = useState("");
  const [showNewTask, setShowNewTask] = useState(false);

  const handleCreateTask = () => {
    if (!newTask.trim() || !selectedProject) return;
    createTask.mutate({ name: newTask.trim(), projectId: selectedProject }, {
      onSuccess: (data) => {
        onTaskChange(data.id);
        setNewTask("");
        setShowNewTask(false);
      },
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Project chips */}
      {projects?.map((p) => (
        <button
          key={p.id}
          onClick={() => { onProjectChange(p.id); onTaskChange(""); }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
            selectedProject === p.id
              ? "ring-2 ring-offset-1 ring-primary shadow-sm scale-105"
              : "opacity-70 hover:opacity-100"
          }`}
          style={{
            backgroundColor: p.color + "20",
            color: p.color,
          }}
        >
          {p.icon} {p.name}
        </button>
      ))}

      {/* Task selector */}
      {selectedProject && tasks && tasks.length > 0 && (
        <div className="w-full flex flex-wrap items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">Task:</span>
          {tasks.map((t) => (
            <button
              key={t.id}
              onClick={() => onTaskChange(selectedTask === t.id ? "" : t.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                selectedTask === t.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/50"
              }`}
            >
              {t.name}
            </button>
          ))}
          {!showNewTask && (
            <button onClick={() => setShowNewTask(true)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-0.5">
              <Plus className="h-3 w-3" /> New
            </button>
          )}
        </div>
      )}

      {/* New task input */}
      {(showNewTask || (selectedProject && (!tasks || tasks.length === 0))) && (
        <div className="w-full flex items-center gap-2 mt-1">
          <input
            type="text"
            placeholder="Task name..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
            className="text-sm bg-secondary/50 rounded-lg px-3 py-1.5 flex-1 focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />
          <button onClick={handleCreateTask} className="text-xs text-primary font-medium">Create</button>
          <button onClick={() => setShowNewTask(false)} className="text-xs text-muted-foreground">Cancel</button>
        </div>
      )}
    </div>
  );
}
