import { useState } from "react";
import {
  useProjects, useTasks, useCreateTask, useDeleteTask,
  useCreateProject, useUpdateProject, useDeleteProject,
} from "@/lib/hooks/useProjects";
import { useTags, useCreateTag, useDeleteTag } from "@/lib/hooks/useTags";
import { ChevronRight, Plus, Trash2, Tag, Pencil, Check, X } from "lucide-react";

export function ProjectManager() {
  const { data: projects } = useProjects();
  const createProject = useCreateProject();
  const { data: tags } = useTags();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#D97757");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#3B82F6");

  const handleCreateTag = () => {
    const name = newTagName.trim();
    if (!name) return;
    createTag.mutate({ name, color: newTagColor });
    setNewTagName("");
  };

  const handleCreateProject = () => {
    const name = newProjectName.trim();
    if (!name) return;
    createProject.mutate({ name, color: newProjectColor });
    setNewProjectName("");
  };

  return (
    <div className="space-y-8">
      {/* Projects + Tasks */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">Engines</h2>
        <div className="space-y-2">
          {projects?.map((p) => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </div>
        {/* Add project */}
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3">
          <input
            type="color"
            value={newProjectColor}
            onChange={(e) => setNewProjectColor(e.target.value)}
            className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            placeholder="New project..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={handleCreateProject}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Add
          </button>
        </div>
      </section>

      {/* Tags */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Tag className="h-4 w-4" />
          Tags
        </h2>

        <div className="flex flex-wrap gap-1.5">
          {tags?.map((t) => (
            <span
              key={t.id}
              className="group inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-border text-foreground"
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
              {t.name}
              <button
                onClick={() => deleteTag.mutate(t.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity ml-0.5"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
          />
          <input
            type="text"
            placeholder="New tag..."
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={handleCreateTag}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Add
          </button>
        </div>
      </section>
    </div>
  );
}

function ProjectRow({ project }: { project: any }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editColor, setEditColor] = useState(project.color);
  const [editGoal, setEditGoal] = useState<string>(String(project.weekly_goal_hours || 0));
  const [editMotor, setEditMotor] = useState<string>(project.motor_number != null ? String(project.motor_number) : "");
  const { data: tasks } = useTasks(project.id);
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [newTask, setNewTask] = useState("");

  const handleAdd = () => {
    const name = newTask.trim();
    if (!name) return;
    createTask.mutate({ name, projectId: project.id });
    setNewTask("");
  };

  const handleSave = () => {
    updateProject.mutate({
      id: project.id,
      name: editName.trim() || project.name,
      color: editColor,
      weekly_goal_hours: parseFloat(editGoal) || 0,
      motor_number: editMotor.trim() ? parseInt(editMotor) : null,
    });
    setEditing(false);
  };

  const handleCancel = () => {
    setEditName(project.name);
    setEditColor(project.color);
    setEditGoal(String(project.weekly_goal_hours || 0));
    setEditMotor(project.motor_number != null ? String(project.motor_number) : "");
    setEditing(false);
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      {editing ? (
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={editColor}
              onChange={(e) => setEditColor(e.target.value)}
              className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium focus:outline-none border-b border-border"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Weekly goal:</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={editGoal}
              onChange={(e) => setEditGoal(e.target.value)}
              className="w-16 bg-transparent text-sm text-center focus:outline-none border-b border-border tabular-nums"
            />
            <span className="text-xs text-muted-foreground">hours</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Engine #:</span>
            <input
              type="number"
              min="1"
              value={editMotor}
              onChange={(e) => setEditMotor(e.target.value)}
              placeholder="—"
              className="w-12 bg-transparent text-sm text-center focus:outline-none border-b border-border tabular-nums"
            />
            <span className="text-[10px] text-muted-foreground">(empty = not an engine)</span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button onClick={handleCancel} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
            <button onClick={handleSave} className="p-1.5 rounded-md hover:bg-secondary text-primary">
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors rounded-l-lg"
          >
            <ChevronRight
              className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? "rotate-90" : ""}`}
            />
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
            <span className="text-sm font-medium text-foreground">{project.name}</span>
            {(project.weekly_goal_hours || 0) > 0 && (
              <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                {project.weekly_goal_hours}h/wk
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">{tasks?.length || 0} tasks</span>
          </button>
          <button
            onClick={() => setEditing(true)}
            className="p-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { if (confirm("Delete project and all its tasks?")) deleteProject.mutate(project.id); }}
            className="p-3 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {expanded && !editing && (
        <div className="px-4 pb-3 pt-1 space-y-1.5 border-t border-border">
          {tasks?.map((t) => (
            <div key={t.id} className="group flex items-center gap-2 py-1.5 pl-6">
              <span className="text-sm text-foreground">{t.name}</span>
              <button
                onClick={() => deleteTask.mutate(t.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity ml-auto"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <div className="flex items-center gap-2 pl-6 pt-1">
            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="New task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
