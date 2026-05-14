"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { STATUS_CHART_COLORS } from "@/lib/chart-colors";
import { STATUS_STYLES } from "@/lib/constants";

interface StatusChartProps {
  byStatus: Record<string, number>;
  total: number;
}

interface TooltipPayload {
  name: string;
  value: number;
  payload: { name: string; value: number };
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-[12px] font-semibold text-foreground">{name}</p>
      <p className="text-[12px] text-muted-foreground">
        {value} application{value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function StatusChart({ byStatus, total }: StatusChartProps) {
  const data = Object.entries(byStatus)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Donut */}
      <div className="relative flex h-[160px] w-[160px] shrink-0 items-center justify-center self-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={72}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={STATUS_CHART_COLORS[entry.name] ?? "#94a3b8"}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Centre label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {total}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Total
          </span>
        </div>
      </div>

      {/* Legend */}
      <ul className="flex flex-1 flex-col gap-2">
        {data.map(({ name, value }) => {
          const style = STATUS_STYLES[name];
          const pct = Math.round((value / total) * 100);
          return (
            <li key={name} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: STATUS_CHART_COLORS[name] ?? "#94a3b8" }}
              />
              <span className="flex-1 text-[12px] text-foreground">
                {style?.label ?? name}
              </span>
              <span className="tabular-nums text-[12px] font-semibold text-foreground">
                {value}
              </span>
              <span className="w-8 text-right tabular-nums text-[11px] text-muted-foreground">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
