import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Play, Clock, FolderOpen, BarChart3 } from "lucide-react";
import { useState } from "react";

const FAKE_PROJECTS = [
  { name: "Learn AI", color: "#0C447C" },
  { name: "Side project", color: "#2E7D32" },
  { name: "Exercise", color: "#E65100" },
];

const FAKE_ENTRIES = [
  { project: "Learn AI", color: "#0C447C", desc: "Neural networks chapter", duration: "1h 12m", time: "9:00 – 10:12" },
  { project: "Side project", color: "#2E7D32", desc: "Auth flow", duration: "48m", time: "10:30 – 11:18" },
  { project: "Exercise", color: "#E65100", desc: "Morning run", duration: "40m", time: "7:00 – 7:40" },
];

function DisabledOverlay({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <div className="pointer-events-none opacity-60">{children}</div>
          <div className="absolute inset-0 cursor-not-allowed" />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Sign up to start tracking</p>
      </TooltipContent>
    </Tooltip>
  );
}

export default function DemoApp() {
  const [tab, setTab] = useState<"timer" | "projects" | "dashboard">("timer");

  return (
    <div className="min-h-screen pb-14" style={{ backgroundColor: "#FAF9F6" }}>
      {/* Header */}
      <header className="border-b sticky top-0 z-10" style={{ borderColor: "#E8E4DF", backgroundColor: "rgba(250,249,246,0.9)", backdropFilter: "blur(8px)" }}>
        <div className="max-w-xl mx-auto px-5 py-3">
          <h1 className="text-lg font-semibold tracking-tight mb-2" style={{ color: "#1A1A1A" }}>Marea</h1>
          <div className="flex rounded-lg p-0.5" style={{ backgroundColor: "#F0EDE8" }}>
            {(["timer", "projects", "dashboard"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-all ${
                  tab === t ? "bg-white shadow-sm" : ""
                }`}
                style={{ color: tab === t ? "#1A1A1A" : "#9B9490" }}
              >
                {t === "timer" ? "Timer" : t === "projects" ? "Projects" : "Dashboard"}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-5 py-6 space-y-6">
        {tab === "timer" && (
          <>
            {/* Timer card — disabled */}
            <DisabledOverlay>
              <div className="rounded-xl border p-6 space-y-4" style={{ backgroundColor: "#fff", borderColor: "#E8E4DF" }}>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="What are you working on?"
                    disabled
                    className="flex-1 bg-transparent text-base focus:outline-none"
                    style={{ color: "#1A1A1A" }}
                  />
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#D97757" }}>
                    <Play className="h-4 w-4 text-white ml-0.5" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: "#9B9490" }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0C447C" }} />
                  <span>Learn AI</span>
                </div>
              </div>
            </DisabledOverlay>

            {/* Manual entry — disabled */}
            <DisabledOverlay>
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed text-sm" style={{ borderColor: "#E8E4DF", color: "#9B9490" }}>
                + Manual entry
              </button>
            </DisabledOverlay>

            {/* Fake timeline */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>Today</h2>
                <span className="text-sm flex items-center gap-1.5" style={{ color: "#9B9490" }}>
                  <Clock className="h-3.5 w-3.5" /> 2h 40m
                </span>
              </div>
              <div className="space-y-1">
                {FAKE_ENTRIES.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-3 rounded-lg" style={{ backgroundColor: i === 0 ? "rgba(217,119,87,0.05)" : "transparent" }}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: e.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate" style={{ color: "#1A1A1A" }}>{e.desc}</div>
                      <div className="text-xs mt-0.5" style={{ color: "#9B9490" }}>{e.project}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm tabular-nums" style={{ color: "#1A1A1A" }}>{e.duration}</span>
                      <div className="text-[11px]" style={{ color: "#9B9490" }}>{e.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "projects" && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>Projects</h2>
            {FAKE_PROJECTS.map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ backgroundColor: "#fff", borderColor: "#E8E4DF" }}>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-sm font-medium" style={{ color: "#1A1A1A" }}>{p.name}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "dashboard" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold" style={{ color: "#1A1A1A" }}>This Week</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total", value: "11h 20m" },
                { label: "Sessions", value: "14" },
                { label: "Avg/day", value: "2h 16m" },
                { label: "Alignment", value: "74%", accent: true },
              ].map((m, i) => (
                <div key={i} className="rounded-xl border p-4 text-center" style={{ backgroundColor: "#fff", borderColor: "#E8E4DF" }}>
                  <div className="text-lg font-semibold tabular-nums" style={{ color: m.accent ? "#D97757" : "#1A1A1A" }}>{m.value}</div>
                  <div className="text-xs mt-1" style={{ color: "#9B9490" }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
