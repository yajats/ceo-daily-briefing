import { format, parseISO, subDays } from "date-fns";
import salesData from "@/data/sales.json";
import inventoryData from "@/data/inventory.json";
import ticketsData from "@/data/support-tickets.json";
import type {
  DailyBriefing,
  InventoryRecord,
  InventoryRisk,
  KeyMetric,
  RevenueTrendPoint,
  SaleRecord,
  SupportTicket,
  AttentionItem,
  SuggestedAction,
} from "./types";

export function loadSales(): SaleRecord[] {
  return salesData as SaleRecord[];
}

export function loadInventory(): InventoryRecord[] {
  return inventoryData as InventoryRecord[];
}

export function loadTickets(): SupportTicket[] {
  return ticketsData as SupportTicket[];
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function sumRevenue(sales: SaleRecord[], start: Date, end: Date): number {
  return sales
    .filter((s) => {
      const d = parseISO(s.date);
      return d >= start && d <= end;
    })
    .reduce((sum, s) => sum + s.revenue, 0);
}

function dateOnly(d: Date): Date {
  return parseISO(format(d, "yyyy-MM-dd"));
}

function toDateOnly(iso: string): Date {
  return parseISO(iso.slice(0, 10));
}

function countTicketsInRange(tickets: SupportTicket[], start: Date, end: Date): number {
  return tickets.filter((t) => {
    const d = toDateOnly(t.createdAt);
    return d >= start && d <= end;
  }).length;
}

function openHighPriorityTickets(tickets: SupportTicket[]): SupportTicket[] {
  return tickets.filter(
    (t) => t.status !== "resolved" && (t.priority === "high" || t.priority === "medium")
  );
}

function computeInventoryRisks(inventory: InventoryRecord[]): InventoryRisk[] {
  return inventory
    .map((item) => {
      const available = item.unitsOnHand - item.unitsReserved;
      const daysUntilStockout =
        item.avgDailySales > 0
          ? Math.floor(available / item.avgDailySales)
          : 999;

      let severity: InventoryRisk["severity"] = "watch";
      if (daysUntilStockout < item.leadTimeDays) severity = "critical";
      else if (daysUntilStockout <= item.leadTimeDays + 7) severity = "warning";

      return {
        productName: item.productName,
        sku: item.sku,
        daysUntilStockout,
        unitsOnHand: available,
        avgDailySales: item.avgDailySales,
        severity,
      };
    })
    .filter((r) => r.severity !== "watch" || r.daysUntilStockout < 30)
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
}

function computeRevenueTrend(sales: SaleRecord[]): RevenueTrendPoint[] {
  const referenceDate = parseISO("2026-06-15");
  const weeks: RevenueTrendPoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const weekEnd = subDays(referenceDate, i * 7);
    const weekStart = subDays(weekEnd, 6);
    const weekSales = sales.filter((s) => {
      const d = parseISO(s.date);
      return d >= weekStart && d <= weekEnd;
    });
    weeks.push({
      week: format(weekStart, "MMM d"),
      revenue: weekSales.reduce((sum, s) => sum + s.revenue, 0),
      orders: weekSales.reduce((sum, s) => sum + s.units, 0),
    });
  }

  return weeks;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toLocaleString()}`;
}

export function generateDailyBriefing(): DailyBriefing {
  const sales = loadSales();
  const inventory = loadInventory();
  const tickets = loadTickets();
  const now = parseISO("2026-06-16T07:00:00Z");

  const thisWeekEnd = dateOnly(subDays(now, 1));
  const thisWeekStart = dateOnly(subDays(thisWeekEnd, 6));
  const lastWeekEnd = dateOnly(subDays(thisWeekStart, 1));
  const lastWeekStart = dateOnly(subDays(lastWeekEnd, 6));

  const thisWeekRevenue = sumRevenue(sales, thisWeekStart, thisWeekEnd);
  const lastWeekRevenue = sumRevenue(sales, lastWeekStart, lastWeekEnd);
  const revenueWoW = pctChange(thisWeekRevenue, lastWeekRevenue);

  const yesterday = subDays(now, 1);
  const dayBefore = subDays(now, 2);
  const yesterdayRevenue = sumRevenue(
    sales,
    yesterday,
    yesterday
  );
  const dayBeforeRevenue = sumRevenue(sales, dayBefore, dayBefore);
  const dailyRevenueChange = pctChange(yesterdayRevenue, dayBeforeRevenue);

  const thisWeekTickets = countTicketsInRange(tickets, thisWeekStart, thisWeekEnd);
  const lastWeekTickets = countTicketsInRange(tickets, lastWeekStart, lastWeekEnd);
  const ticketChange = pctChange(thisWeekTickets, lastWeekTickets);

  const openTickets = tickets.filter((t) => t.status !== "resolved").length;
  const shippingTickets = tickets.filter(
    (t) =>
      t.category === "shipping" &&
      t.status !== "resolved" &&
      toDateOnly(t.createdAt) >= thisWeekStart &&
      toDateOnly(t.createdAt) <= thisWeekEnd
  ).length;

  const inventoryRisks = computeInventoryRisks(inventory);
  const revenueTrend = computeRevenueTrend(sales);
  const criticalRisk = inventoryRisks.find((r) => r.severity === "critical");

  const keyMetrics: KeyMetric[] = [
    {
      label: "Weekly Revenue",
      value: formatCurrency(thisWeekRevenue),
      change: revenueWoW,
      changeLabel: "vs last week",
      trend: revenueWoW >= 0 ? "up" : "down",
      positiveIsGood: true,
    },
    {
      label: "Yesterday Revenue",
      value: formatCurrency(yesterdayRevenue),
      change: dailyRevenueChange,
      changeLabel: "vs prior day",
      trend: dailyRevenueChange >= 0 ? "up" : "down",
      positiveIsGood: true,
    },
    {
      label: "Open Support Tickets",
      value: openTickets.toString(),
      change: ticketChange,
      changeLabel: "ticket volume WoW",
      trend: ticketChange <= 0 ? "up" : "down",
      positiveIsGood: false,
    },
    {
      label: "Avg Order Value",
      value: "$38.40",
      change: 4.2,
      changeLabel: "vs last week",
      trend: "up",
      positiveIsGood: true,
    },
  ];

  const attentionItems: AttentionItem[] = [];

  if (ticketChange > 10) {
    attentionItems.push({
      severity: ticketChange > 15 ? "critical" : "warning",
      title: `Customer complaints increased ${Math.abs(ticketChange)}% this week`,
      description: `${thisWeekTickets} tickets opened this week vs ${lastWeekTickets} last week. Shipping (${shippingTickets} open) and quality categories are driving the spike.`,
    });
  }

  if (criticalRisk) {
    attentionItems.push({
      severity: "critical",
      title: `${criticalRisk.productName} may run out in ${criticalRisk.daysUntilStockout} days`,
      description: `Only ${criticalRisk.unitsOnHand.toLocaleString()} units available at ${criticalRisk.avgDailySales}/day velocity. Lead time exceeds remaining runway — expedite PO immediately.`,
    });
  }

  const qualityTickets = tickets.filter(
    (t) => t.category === "quality" && t.status === "open" && t.priority === "high"
  );
  if (qualityTickets.length > 0) {
    attentionItems.push({
      severity: "warning",
      title: `${qualityTickets.length} open quality escalations`,
      description: `Latest: "${qualityTickets[0].subject}" (${qualityTickets[0].id}). Cross-check with production batch logs.`,
    });
  }

  const unresolvedHigh = openHighPriorityTickets(tickets).filter((t) => t.priority === "high");
  if (unresolvedHigh.length >= 3) {
    attentionItems.push({
      severity: "warning",
      title: `${unresolvedHigh.length} high-priority tickets unresolved`,
      description: "CX backlog may impact NPS and repeat purchase rate. Consider temporary staffing or auto-triage rules.",
    });
  }

  if (attentionItems.length === 0) {
    attentionItems.push({
      severity: "info",
      title: "No critical issues flagged",
      description: "All systems operating within normal parameters. Continue monitoring inventory velocity.",
    });
  }

  const suggestedActions: SuggestedAction[] = [];

  if (criticalRisk) {
    suggestedActions.push({
      priority: 1,
      action: `Place emergency reorder for ${criticalRisk.productName}`,
      rationale: `Stockout projected in ${criticalRisk.daysUntilStockout} days — below ${inventory.find((i) => i.sku === criticalRisk.sku)?.leadTimeDays}-day lead time.`,
      owner: "Head of Operations",
    });
  }

  if (ticketChange > 10) {
    suggestedActions.push({
      priority: 2,
      action: "Audit shipping carrier SLA and publish proactive delay comms",
      rationale: `${shippingTickets} shipping tickets this week. Proactive emails could reduce inbound volume by ~20%.`,
      owner: "Head of CX",
    });
  }

  if (revenueWoW > 8) {
    suggestedActions.push({
      priority: 3,
      action: "Increase ad spend on top-performing DTC SKUs by 15%",
      rationale: `Revenue grew ${revenueWoW}% week-over-week. Hydrate+ and Protein Bar are leading — capitalize on momentum before CAC rises.`,
      owner: "Head of Growth",
    });
  }

  const lowStock = inventoryRisks.filter((r) => r.severity === "warning");
  if (lowStock.length > 0) {
    suggestedActions.push({
      priority: 4,
      action: `Review reorder schedule for ${lowStock.map((r) => r.productName).join(", ")}`,
      rationale: "Multiple SKUs approaching reorder point within 2 weeks. Batch POs to reduce freight costs.",
      owner: "Head of Operations",
    });
  }

  suggestedActions.push({
    priority: 5,
    action: "Schedule weekly cross-functional standup on inventory + CX trends",
    rationale: "Align ops, growth, and CX on leading indicators before they become revenue drag.",
    owner: "CEO",
  });

  suggestedActions.sort((a, b) => a.priority - b.priority);

  const summaryParts: string[] = [];
  summaryParts.push(
    revenueWoW >= 0
      ? `Revenue grew ${revenueWoW}% week-over-week to ${formatCurrency(thisWeekRevenue)}.`
      : `Revenue declined ${Math.abs(revenueWoW)}% week-over-week to ${formatCurrency(thisWeekRevenue)}.`
  );

  if (criticalRisk) {
    summaryParts.push(
      `Inventory of ${criticalRisk.productName} may run out in ${criticalRisk.daysUntilStockout} days.`
    );
  }

  if (ticketChange > 0) {
    summaryParts.push(
      `Customer complaints increased ${ticketChange}% this week (${thisWeekTickets} tickets).`
    );
  }

  return {
    generatedAt: now.toISOString(),
    greeting: `Good morning — here's your briefing for ${format(now, "EEEE, MMMM d")}.`,
    summary: summaryParts.join(" "),
    keyMetrics,
    attentionItems,
    inventoryRisks,
    revenueTrend,
    revenueWoWChange: revenueWoW,
    suggestedActions,
  };
}
