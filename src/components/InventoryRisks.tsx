import { Package, AlertTriangle, Eye } from "lucide-react";
import type { InventoryRisk } from "@/lib/types";

interface InventoryRisksProps {
  risks: InventoryRisk[];
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: "text-critical",
    bg: "bg-critical-bg",
    label: "Critical",
  },
  warning: {
    icon: Package,
    color: "text-warning",
    bg: "bg-warning-bg",
    label: "Warning",
  },
  watch: {
    icon: Eye,
    color: "text-accent",
    bg: "bg-accent-bg",
    label: "Watch",
  },
};

export function InventoryRisks({ risks }: InventoryRisksProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Inventory Risks</h2>
      <p className="mt-1 text-sm text-muted">Projected stockouts based on current velocity</p>
      <div className="mt-5 space-y-3">
        {risks.map((risk) => {
          const config = severityConfig[risk.severity];
          const Icon = config.icon;
          const barWidth = Math.min(100, Math.max(8, (30 - risk.daysUntilStockout) / 30 * 100));

          return (
            <div key={risk.sku} className={`rounded-xl p-4 ${config.bg}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`} />
                  <div>
                    <p className="font-medium text-foreground">{risk.productName}</p>
                    <p className="text-sm text-muted">SKU: {risk.sku}</p>
                  </div>
                </div>
                <span className={`shrink-0 text-sm font-semibold ${config.color}`}>
                  {risk.daysUntilStockout} days
                </span>
              </div>
              <div className="mt-3">
                <div className="h-2 overflow-hidden rounded-full bg-white/60">
                  <div
                    className={`h-full rounded-full transition-all ${
                      risk.severity === "critical"
                        ? "bg-critical"
                        : risk.severity === "warning"
                          ? "bg-warning"
                          : "bg-accent-light"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  {risk.unitsOnHand.toLocaleString()} units available · {risk.avgDailySales}/day avg sales
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
