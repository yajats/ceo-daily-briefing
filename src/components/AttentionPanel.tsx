import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { AttentionItem } from "@/lib/types";

interface AttentionPanelProps {
  items: AttentionItem[];
}

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    bg: "bg-critical-bg",
    border: "border-red-200",
    iconColor: "text-critical",
    badge: "Critical",
    badgeBg: "bg-critical text-white",
  },
  warning: {
    icon: AlertCircle,
    bg: "bg-warning-bg",
    border: "border-amber-200",
    iconColor: "text-warning",
    badge: "Attention",
    badgeBg: "bg-warning text-white",
  },
  info: {
    icon: Info,
    bg: "bg-accent-bg",
    border: "border-green-200",
    iconColor: "text-accent",
    badge: "Info",
    badgeBg: "bg-accent text-white",
  },
};

export function AttentionPanel({ items }: AttentionPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground">Problems Requiring Attention</h2>
      <p className="mt-1 text-sm text-muted">Flagged by AI analysis of sales, inventory, and support data</p>
      <div className="mt-5 space-y-3">
        {items.map((item, i) => {
          const config = severityConfig[item.severity];
          const Icon = config.icon;
          return (
            <div
              key={i}
              className={`flex gap-4 rounded-xl border p-4 ${config.bg} ${config.border}`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeBg}`}>
                    {config.badge}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
