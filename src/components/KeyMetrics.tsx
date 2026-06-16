import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KeyMetric } from "@/lib/types";

interface KeyMetricsProps {
  metrics: KeyMetric[];
}

function TrendIcon({ trend, isGood }: { trend: KeyMetric["trend"]; isGood: boolean }) {
  const color = isGood ? "text-accent-light" : "text-critical";
  if (trend === "up") return <TrendingUp className={`h-4 w-4 ${color}`} />;
  if (trend === "down") return <TrendingDown className={`h-4 w-4 ${color}`} />;
  return <Minus className="h-4 w-4 text-muted" />;
}

export function KeyMetrics({ metrics }: KeyMetricsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const isPositiveChange = metric.change >= 0;
        const isGood = metric.positiveIsGood ? isPositiveChange : !isPositiveChange;

        return (
          <div
            key={metric.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <p className="text-sm font-medium text-muted">{metric.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              {metric.value}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <TrendIcon trend={metric.trend} isGood={isGood} />
              <span className={`text-sm font-medium ${isGood ? "text-accent-light" : "text-critical"}`}>
                {metric.change >= 0 ? "+" : ""}
                {metric.change}%
              </span>
              <span className="text-sm text-muted">{metric.changeLabel}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
