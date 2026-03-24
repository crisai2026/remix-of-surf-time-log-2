import { useAppContext } from "@/contexts/AppContext";

export function DemoBanner() {
  const { mode, setShowAuthModal } = useAppContext();

  if (mode !== "demo") return null;

  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-center gap-3 px-4 py-2 text-sm"
      style={{ backgroundColor: "#FFF3ED", color: "#D97757", borderBottom: "1px solid #F0D6C8" }}
    >
      <span className="font-medium">Demo mode · explore freely</span>
      <button
        onClick={() => setShowAuthModal(true)}
        className="px-3 py-1 rounded-md text-xs font-semibold text-white transition-colors"
        style={{ backgroundColor: "#D97757" }}
      >
        Enter
      </button>
    </div>
  );
}
