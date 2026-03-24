import { useMemo } from "react";
import { InfoTooltip } from "./InfoTooltip";

interface Props {
  planned: number[]; // 5 days Mon-Fri
  actual: number[];  // 5 days Mon-Fri
}

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie"];

export function SessionsPerDayChart({ planned, actual }: Props) {
  const maxVal = useMemo(() => Math.max(...planned, ...actual, 1), [planned, actual]);

  const chartH = 140;
  const chartW = 320;
  const padL = 24;
  const padR = 12;
  const padT = 28;
  const padB = 24;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const xStep = innerW / 4;
  const toX = (i: number) => padL + i * xStep;
  const toY = (v: number) => padT + innerH - (v / maxVal) * innerH;

  const plannedPath = planned.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");
  const actualPath = actual.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");
  const areaPath = `${actualPath} L${toX(4)},${toY(0)} L${toX(0)},${toY(0)} Z`;

  // Grid lines
  const gridLines = [];
  const yTicks = [];
  for (let v = 0; v <= maxVal; v++) {
    const y = toY(v);
    gridLines.push(y);
    yTicks.push({ y, label: v });
  }

  return (
    <div className="rounded-xl bg-card border border-border p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold">sesiones por día</h3>
          <InfoTooltip text="Cada punto muestra cuántos bloques de motor arrancaste ese día. La línea punteada es lo que tenías planificado." />
        </div>
        <span className="text-[10px] text-muted-foreground">meta vs real</span>
      </div>

      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: 180 }}>
        {/* Grid */}
        {gridLines.map((y, i) => (
          <line key={i} x1={padL} x2={chartW - padR} y1={y} y2={y} stroke="hsl(var(--border))" strokeWidth={0.5} />
        ))}
        {/* Y labels */}
        {yTicks.map((t, i) => (
          <text key={i} x={padL - 6} y={t.y + 3} textAnchor="end" className="fill-muted-foreground" fontSize={9}>{t.label}</text>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="hsl(var(--primary))" opacity={0.06} />

        {/* Planned dashed line */}
        <path d={plannedPath} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 3" />

        {/* Actual solid line */}
        <path d={actualPath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />

        {/* Dots and labels */}
        {planned.map((v, i) => (
          <circle key={`p${i}`} cx={toX(i)} cy={toY(v)} r={3.5} fill="hsl(var(--card))" stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} />
        ))}
        {actual.map((v, i) => {
          const missed = v < planned[i];
          return (
            <g key={`a${i}`}>
              <circle cx={toX(i)} cy={toY(v)} r={3.5} fill="hsl(var(--primary))" opacity={missed ? 0.6 : 1} />
              <text
                x={toX(i)}
                y={toY(Math.max(v, planned[i])) - 8}
                textAnchor="middle"
                fontSize={9}
                fontWeight={missed ? 700 : 500}
                className={missed ? "fill-primary" : "fill-foreground"}
              >
                {v}/{planned[i]}
              </text>
            </g>
          );
        })}

        {/* Day labels */}
        {DAYS.map((d, i) => {
          const missed = actual[i] < planned[i];
          return (
            <text
              key={i}
              x={toX(i)}
              y={chartH - 4}
              textAnchor="middle"
              fontSize={10}
              fontWeight={missed ? 700 : 400}
              className={missed ? "fill-primary" : "fill-muted-foreground"}
            >
              {d}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
