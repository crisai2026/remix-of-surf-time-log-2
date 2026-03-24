import { InfoTooltip } from "./InfoTooltip";

interface Props {
  weeks: { label: string; sessions: number; isCurrent: boolean }[];
}

export function WeeklyTrendChart({ weeks }: Props) {
  if (weeks.length === 0) return null;

  const maxVal = Math.max(...weeks.map(w => w.sessions), 1);

  const chartH = 120;
  const chartW = 320;
  const padL = 24;
  const padR = 12;
  const padT = 24;
  const padB = 20;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const count = weeks.length;
  const xStep = count > 1 ? innerW / (count - 1) : 0;
  const toX = (i: number) => padL + i * xStep;
  const toY = (v: number) => padT + innerH - (v / maxVal) * innerH;

  const linePath = weeks.map((w, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(w.sessions)}`).join(" ");
  const areaPath = `${linePath} L${toX(count - 1)},${toY(0)} L${toX(0)},${toY(0)} Z`;

  const step = Math.max(1, Math.ceil(maxVal / 3));
  const yTicks: number[] = [];
  for (let v = 0; v <= maxVal + step; v += step) {
    if (v > maxVal + 1) break;
    yTicks.push(v);
  }

  return (
    <div className="rounded-xl bg-card border border-border p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <h3 className="text-xs font-semibold">tendencia semanal</h3>
          <InfoTooltip text="Cuántas sesiones de motor arrancaste cada semana. Si la línea sube, estás siendo más consistente." />
        </div>
        <span className="text-[10px] text-muted-foreground">sesiones por semana</span>
      </div>

      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ maxHeight: 140 }}>
        {yTicks.map((v, i) => (
          <g key={i}>
            <line x1={padL} x2={chartW - padR} y1={toY(v)} y2={toY(v)} stroke="hsl(var(--border))" strokeWidth={0.5} />
            
          </g>
        ))}

        <path d={areaPath} fill="hsl(var(--primary))" opacity={0.08} />
        <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} />

        {weeks.map((w, i) => (
          <g key={i}>
            {w.isCurrent ? (
              <circle cx={toX(i)} cy={toY(w.sessions)} r={3.5} fill="hsl(var(--primary))" stroke="hsl(var(--card))" strokeWidth={1.5} />
            ) : (
              <circle cx={toX(i)} cy={toY(w.sessions)} r={3} fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth={1.5} />
            )}
            <text
              x={toX(i)}
              y={toY(w.sessions) - 7}
              textAnchor="middle"
              fontSize={9}
              fontWeight={w.isCurrent ? 700 : 400}
              className={w.isCurrent ? "fill-primary" : "fill-muted-foreground"}
            >
              {w.sessions}
            </text>
            <text
              x={toX(i)}
              y={chartH - 3}
              textAnchor="middle"
              fontSize={9}
              fontWeight={w.isCurrent ? 700 : 400}
              className={w.isCurrent ? "fill-primary" : "fill-muted-foreground"}
            >
              {w.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
