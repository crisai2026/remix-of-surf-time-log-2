import { useState, useEffect } from "react";
import { Play, Square, Pause, ChevronDown } from "lucide-react";
import { useRunningEntry, useStartTimer, useStopTimer, usePauseTimer, useResumeTimer } from "@/lib/hooks/useTimeEntries";
import { useProjects, useTasks } from "@/lib/hooks/useProjects";
import { useSetEntryTags } from "@/lib/hooks/useTags";
import { formatTimer } from "@/lib/formatTime";
import { TagSelector } from "@/components/TagSelector";

export function Timer() {
  const { data: running } = useRunningEntry();
  const { data: projects } = useProjects();
  const startTimer = useStartTimer();
  const stopTimer = useStopTimer();
  const pauseTimer = usePauseTimer();
  const resumeTimer = useResumeTimer();
  const setEntryTags = useSetEntryTags();

  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [showProjects, setShowProjects] = useState(false);

  const { data: tasks } = useTasks(selectedProject);

  const isPaused = running && (running as any).paused_at;

  useEffect(() => {
    if (projects?.length && !selectedProject) {
      setSelectedProject(projects[0].id);
    }
  }, [projects, selectedProject]);

  useEffect(() => {
    if (!running) { setElapsed(0); return; }
    const pausedSec = (running as any).paused_seconds || 0;
    const tick = () => {
      if ((running as any).paused_at) {
        const pausedAt = new Date((running as any).paused_at).getTime();
        const totalElapsed = Math.floor((pausedAt - new Date(running.start_time).getTime()) / 1000);
        setElapsed(totalElapsed - pausedSec);
      } else {
        const totalElapsed = Math.floor((Date.now() - new Date(running.start_time).getTime()) / 1000);
        setElapsed(totalElapsed - pausedSec);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running]);

  const handleStart = () => {
    if (!selectedProject) return;
    startTimer.mutate(
      {
        projectId: selectedProject,
        taskId: selectedTask || undefined,
        description: description || undefined,
      },
      {
        onSuccess: (entry) => {
          if (selectedTags.length > 0) {
            setEntryTags.mutate({ entryId: entry.id, tagIds: selectedTags });
          }
        },
      }
    );
  };

  const handleStop = () => {
    if (running) stopTimer.mutate(running.id);
  };

  const handlePauseResume = () => {
    if (!running) return;
    if (isPaused) {
      resumeTimer.mutate(running.id);
    } else {
      pauseTimer.mutate(running.id);
    }
  };

  const currentProject = projects?.find((p) => p.id === selectedProject);
  const runningProject = running?.projects;

  return (
    <div className="space-y-4">
      {running ? (
        <div className="rounded-xl bg-card border border-border p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className={`text-3xl font-semibold tabular-nums tracking-tight ${isPaused ? "text-muted-foreground" : "text-foreground"}`}>
                {formatTimer(elapsed)}
              </div>
              {isPaused && (
                <span className="text-[10px] uppercase tracking-wider text-primary font-medium">Paused</span>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {runningProject && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: runningProject.color }} />
                    {runningProject.name}
                  </span>
                )}
                {running.description && (
                  <span className="text-muted-foreground">{running.description}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePauseResume}
                className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/80 transition-colors"
              >
                {isPaused ? <Play className="h-4 w-4 ml-0.5" /> : <Pause className="h-4 w-4" />}
              </button>
              <button
                onClick={handleStop}
                className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
              >
                <Square className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-card border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="What are you working on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              className="flex-1 bg-transparent text-base placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              onClick={handleStart}
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0"
            >
              <Play className="h-4 w-4 ml-0.5" />
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProjects(!showProjects)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {currentProject && (
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentProject.color }} />
              )}
              <span>{currentProject?.name || "Select project"}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            {showProjects && (
              <div className="absolute top-full left-0 mt-2 bg-card border border-border rounded-lg shadow-lg py-1 z-20 min-w-[200px]">
                {projects?.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedProject(p.id);
                      setSelectedTask("");
                      setShowProjects(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2.5 hover:bg-secondary transition-colors ${
                      selectedProject === p.id ? "text-foreground" : "text-muted-foreground"
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
            <div className="flex flex-wrap items-center gap-1.5">
              {tasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTask(selectedTask === t.id ? "" : t.id)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                    selectedTask === t.id
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
        </div>
      )}
    </div>
  );
}
