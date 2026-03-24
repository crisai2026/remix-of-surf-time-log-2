import { useMemo } from "react";
import { InfoTooltip } from "./InfoTooltip";

interface Props {
  planned: number[]; // 5 days Mon-Fri
  actual: number[];  // 5 days Mon-Fri
  todayDayIndex: number; // 0=Mon .. 4=Fri
}

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie"];

export function SessionsPerDayChart({ planned, actual, todayDayIndex }: Props) {
  const maxVal = useMemo(() => Math.max(...planned, ...actual, 1), [planned, actual]);

  const chartH = 120;
  const chartW = 320;
  const padL = 24;
  const padR = 12;
  const padT = 24;
  const padB = 20;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const xStep = innerW / 4;
  const toX = (i: number) => padL + i * xStep;
  const toY = (v: number) => padT + innerH - (v / maxVal) * innerH;

  const plannedPath = planned.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");

  // Actual line only up to today
  const actualSlice = actual.slice(0, todayDayIndex + 1);
  const actualPath = actualSlice.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");
  const areaPath = actualSlice.length > 0
    ? `${actualPath} L${toX(todayDayIndex)},${toY(0)} L${toX(0)},${toY(0)} Z`
    : "";

  // Grid lines
  const gridLines: { y: number; label: number }[] = [];
  for (let v = 0; v <= maxVal; v++) {
    gridLines.push({ y: toY(v), label: v });
  }

  return (
    <div className="rounded-xl bg-card border border-border p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold">sesiones por día</h3>
          <InfoTooltip text="Cada punto muestra cuántos bloques de motor arrancaste ese día. La línea punteada es lo que tenías planificado." />
        </div>
        <span className="text-[10px] text-muted-foreground">meta vs real</span>
      </div>

      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: 140 }}>
        {/* Grid */}
        {gridLines.map((g, i) => (
          <line key={i} x1={padL} x2={chartW - padR} y1={g.y} y2={g.y} stroke="hsl(var(--border))" strokeWidth={0.5} />
        ))}
        {/* Y labels */}
        {gridLines.map((g, i) => (
          <text key={i} x={padL - 6} y={g.y + 3} textAnchor="end" className="fill-muted-foreground" fontSize={9}>{g.label}</text>
        ))}

        {/* Area fill */}
        {areaPath && <path d={areaPath} fill="hsl(var(--primary))" opacity={0.06} />}

        {/* Planned dashed line (full week) */}
        <path d={plannedPath} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Actual solid line (up to today) */}
        {actualSlice.length > 0 && (
          <path d={actualPath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />
        )}

        {/* Planned dots (all days) */}
        {planned.map((v, i) => (
          <circle key={`p${i}`} cx={toX(i)} cy={toY(v)} r={3} fill="hsl(var(--card))" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} />
        ))}

        {/* Actual dots + labels (only up to today) */}
        {actualSlice.map((v, i) => {
          const missed = v < planned[i];
          return (
            <g key={`a${i}`}>
              <circle cx={toX(i)} cy={toY(v)} r={3} fill="hsl(var(--primary))" opacity={missed ? 0.6 : 1} />
              <text
                x={toX(i)}
                y={toY(Math.max(v, planned[i])) - 7}
                textAnchor="middle"
                fontSize={9}
                fontWeight={missed ? 700 : 400}
                className={missed ? "fill-primary" : "fill-muted-foreground"}
              >
                {v}/{planned[i]}
              </text>
            </g>
          );
        })}

        {/* Day labels */}
        {DAYS.map((d, i) => {
          const isFuture = i > todayDayIndex;
          const missed = !isFuture && actual[i] < planned[i];
          return (
            <text
              key={i}
              x={toX(i)}
              y={chartH - 3}
              textAnchor="middle"
              fontSize={9}
              fontWeight={missed ? 700 : 400}
              className={missed ? "fill-primary" : "fill-muted-foreground"}
              opacity={isFuture ? 0.4 : 1}
            >
              {d}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
