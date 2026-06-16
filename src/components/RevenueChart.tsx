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
import type { RevenueTrendPoint } from "@/lib/types";

interface RevenueChartProps {
  data: RevenueTrendPoint[];
  wowChange: number;
}

function formatRevenue(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value}`;
}

export function RevenueChart({ data, wowChange }: RevenueChartProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Revenue Trends</h2>
          <p className="mt-1 text-sm text-muted">Weekly revenue over the last 6 weeks</p>
        </div>
        <div className="rounded-xl bg-accent-bg px-4 py-2">
          <p className="text-xs font-medium text-muted">Week-over-week</p>
          <p className={`text-xl font-semibold ${wowChange >= 0 ? "text-accent-light" : "text-critical"}`}>
            {wowChange >= 0 ? "+" : ""}
            {wowChange}%
          </p>
        </div>
      </div>
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#40916c" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#40916c" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2ebe2" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fill: "#6b7c6b", fontSize: 12 }}
              axisLine={{ stroke: "#e2ebe2" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatRevenue}
              tick={{ fill: "#6b7c6b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2ebe2",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value) => [formatRevenue(Number(value ?? 0)), "Revenue"]}
              labelFormatter={(label) => `Week of ${label}`}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2d6a4f"
              strokeWidth={2}
              fill="url(#revenueGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
