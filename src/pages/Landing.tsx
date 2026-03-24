import { useAppContext } from "@/contexts/AppContext";

export default function Landing() {
  const { setMode, setShowAuthModal } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAF9F6" }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-lg mx-auto w-full">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <svg viewBox="0 0 80 48" className="mb-4" style={{ width: 72, height: 44 }}>
            <line x1="12" y1="12" x2="68" y2="12" stroke="#D97757" strokeWidth="3" strokeLinecap="round" opacity="0.25" />
            <line x1="12" y1="24" x2="68" y2="24" stroke="#D97757" strokeWidth="4.5" strokeLinecap="round" opacity="0.55" />
            <line x1="12" y1="36" x2="68" y2="36" stroke="#D97757" strokeWidth="6" strokeLinecap="round" opacity="1" />
          </svg>
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: "#1A1A1A" }}>
            Marea
          </h1>
        </div>

        {/* Tagline & body */}
        <div className="text-center mb-8">
          <p className="text-lg font-semibold mb-2" style={{ color: "#1A1A1A" }}>
            Measure what matters.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "#6B6560" }}>
            Marea helps you see the gap between what you do and what you planned — so your week flows instead of fights back.
          </p>
        </div>

        {/* Demo preview card */}
        <div className="w-full rounded-2xl border p-5 mb-8" style={{ backgroundColor: "#fff", borderColor: "#E8E4DF" }}>
          {/* Mini timer */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-semibold tabular-nums" style={{ color: "#1A1A1A" }}>01:42</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0C447C" }} />
                <span className="text-xs" style={{ color: "#6B6560" }}>Learn AI</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#D97757" }}>
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><rect x="6" y="6" width="12" height="12" rx="1" /></svg>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-2">
            <MetricCard label="Today" value="2h 40m" />
            <MetricCard label="Streak" value="5 days" />
            <MetricCard label="This week" value="11h 20m" />
            <MetricCard label="Alignment" value="74%" accent />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => setMode("demo")}
          className="w-full py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: "#D97757" }}
        >
          Try the demo →
        </button>

        <button
          onClick={() => setShowAuthModal(true)}
          className="mt-4 text-sm transition-colors"
          style={{ color: "#9B9490" }}
        >
          Already have an account? <span className="underline" style={{ color: "#D97757" }}>Log in</span>
        </button>
      </div>
    </div>
  );
}

function MetricCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-lg p-2 text-center" style={{ backgroundColor: "#FAF9F6" }}>
      <div
        className="text-sm font-semibold tabular-nums"
        style={{ color: accent ? "#D97757" : "#1A1A1A" }}
      >
        {value}
      </div>
      <div className="text-[10px]" style={{ color: "#9B9490" }}>{label}</div>
    </div>
  );
}
