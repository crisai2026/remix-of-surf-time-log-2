import { AlertTriangle, CheckCircle } from "lucide-react";
import { InfoTooltip } from "./InfoTooltip";

interface MotorInfo {
  label: string;
  actualHours: number;
  goalHours: number;
  pct: number;
}

interface Props {
  motors: MotorInfo[];
}

export function MotorAlert({ motors }: Props) {
  if (motors.length === 0) return null;

  const allAbove80 = motors.every(m => m.pct >= 80);
  const neglected = motors
    .filter(m => m.goalHours > 0)
    .sort((a, b) => a.pct - b.pct)[0];

  if (allAbove80) {
    return (
      <div className="rounded-xl px-3 py-2 flex items-center gap-3 border" style={{ backgroundColor: "#E8F5E9", borderColor: "#C8E6C9" }}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: "#C8E6C9" }}>
          <CheckCircle className="h-4 w-4" style={{ color: "#2E7D32" }} />
        </div>
        <p className="text-xs font-medium flex-1" style={{ color: "#2E7D32" }}>
          All engines are on track this week.
        </p>
      </div>
    );
  }

  if (!neglected || neglected.pct >= 60) return null;

  return (
    <div className="rounded-xl px-3 py-2 flex items-center gap-3 border" style={{ backgroundColor: "#FFF8E1", borderColor: "#E8D5A0" }}>
      <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ backgroundColor: "#F0E0A0" }}>
        <AlertTriangle className="h-4 w-4" style={{ color: "#B8860B" }} />
      </div>
      <p className="text-xs font-medium flex-1" style={{ color: "#5D4E37" }}>
        {neglected.label} is at {Math.round(neglected.pct)}% of its goal — it's your most neglected engine this week.
      </p>
      <InfoTooltip text={`${neglected.label}: planned ${neglected.goalHours}h, logged ${neglected.actualHours}h.`} />
    </div>
  );
}
