"use client";

import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { RefreshCw, Sun } from "lucide-react";
import type { DailyBriefing } from "@/lib/types";
import { KeyMetrics } from "./KeyMetrics";
import { AttentionPanel } from "./AttentionPanel";
import { InventoryRisks } from "./InventoryRisks";
import { RevenueChart } from "./RevenueChart";
import { SuggestedActions } from "./SuggestedActions";

export function Dashboard() {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchBriefing() {
    const res = await fetch("/api/briefing");
    const data = await res.json();
    setBriefing(data);
  }

  useEffect(() => {
    fetchBriefing().finally(() => setLoading(false));
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchBriefing();
    setRefreshing(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <p className="text-sm text-muted">Generating your morning briefing...</p>
        </div>
      </div>
    );
  }

  if (!briefing) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
              <span className="text-lg font-bold text-white">A</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Aonic</h1>
              <p className="text-xs text-muted">CEO Daily Briefing</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent-bg disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Regenerate
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="animate-fade-in mb-8">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-full bg-accent-bg p-2">
              <Sun className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                {briefing.greeting}
              </h2>
              <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted">
                {briefing.summary}
              </p>
              <p className="mt-3 text-xs text-muted">
                Generated {format(parseISO(briefing.generatedAt), "h:mm a")} · AI-powered analysis
              </p>
            </div>
          </div>
        </div>

        <div className="animate-fade-in-delay-1 mb-8">
          <KeyMetrics metrics={briefing.keyMetrics} />
        </div>

        <div className="animate-fade-in-delay-2 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AttentionPanel items={briefing.attentionItems} />
          <InventoryRisks risks={briefing.inventoryRisks} />
        </div>

        <div className="animate-fade-in-delay-3 mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <RevenueChart data={briefing.revenueTrend} wowChange={briefing.revenueWoWChange} />
          </div>
          <div className="lg:col-span-2">
            <SuggestedActions actions={briefing.suggestedActions} />
          </div>
        </div>

        <footer className="mt-12 border-t border-border pt-6 text-center text-xs text-muted">
          Data sources: Shopify sales · Warehouse inventory · Zendesk support tickets · Generated daily at 7:00 AM PT
        </footer>
      </main>
    </div>
  );
}
