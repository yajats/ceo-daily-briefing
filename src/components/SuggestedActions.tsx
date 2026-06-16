import { ArrowRight, Sparkles } from "lucide-react";
import type { SuggestedAction } from "@/lib/types";

interface SuggestedActionsProps {
  actions: SuggestedAction[];
}

export function SuggestedActions({ actions }: SuggestedActionsProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold text-foreground">Suggested Actions</h2>
      </div>
      <p className="mt-1 text-sm text-muted">AI-recommended priorities for today</p>
      <ol className="mt-5 space-y-4">
        {actions.map((action) => (
          <li key={action.priority} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
              {action.priority}
            </span>
            <div className="min-w-0 flex-1 border-b border-border pb-4 last:border-0 last:pb-0">
              <p className="font-medium text-foreground">{action.action}</p>
              <p className="mt-1 text-sm text-muted">{action.rationale}</p>
              <div className="mt-2 flex items-center gap-1 text-sm text-accent">
                <span>{action.owner}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
