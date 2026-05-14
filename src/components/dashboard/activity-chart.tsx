"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO, startOfWeek, addDays, eachWeekOfInterval, subWeeks } from "date-fns";
import type { Application } from "@/types";

interface ActivityChartProps {
  applications: Application[];
}

interface TooltipPayload {
  value: number;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-[13px] font-semibold text-foreground">
        {payload[0].value} added
      </p>
    </div>
  );
}

export function ActivityChart({ applications }: ActivityChartProps) {
  const now = new Date();
  const weeksBack = 8;
  const start = startOfWeek(subWeeks(now, weeksBack - 1), { weekStartsOn: 1 });

  const weeks = eachWeekOfInterval(
    { start, end: startOfWeek(now, { weekStartsOn: 1 }) },
    { weekStartsOn: 1 }
  );

  const data = weeks.map((weekStart) => {
    const weekEnd = addDays(weekStart, 6);
    const count = applications.filter((a) => {
      const d = parseISO(a.createdAt);
      return d >= weekStart && d <= weekEnd;
    }).length;
    return {
      week: format(weekStart, "MMM d"),
      count,
    };
  });

  const maxVal = Math.max(...data.map((d) => d.count), 1);

  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(220 13% 91%)"
          className="dark:[stroke:hsl(222_47%_13%)]"
        />
        <XAxis
          dataKey="week"
          tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: "hsl(220 9% 46%)" }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          domain={[0, maxVal + 1]}
          width={32}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#6366f1", strokeWidth: 1, strokeDasharray: "4 4" }} />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#activityGradient)"
          dot={false}
          activeDot={{ r: 4, fill: "#6366f1", stroke: "white", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
