export interface SaleRecord {
  date: string;
  productId: string;
  productName: string;
  units: number;
  revenue: number;
  channel: "dtc" | "amazon" | "wholesale";
}

export interface InventoryRecord {
  productId: string;
  productName: string;
  sku: string;
  unitsOnHand: number;
  unitsReserved: number;
  reorderPoint: number;
  leadTimeDays: number;
  avgDailySales: number;
}

export interface SupportTicket {
  id: string;
  createdAt: string;
  category: "shipping" | "quality" | "billing" | "product" | "other";
  priority: "low" | "medium" | "high";
  status: "open" | "pending" | "resolved";
  subject: string;
}

export interface KeyMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: "up" | "down" | "neutral";
  positiveIsGood: boolean;
}

export interface AttentionItem {
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
}

export interface InventoryRisk {
  productName: string;
  sku: string;
  daysUntilStockout: number;
  unitsOnHand: number;
  avgDailySales: number;
  severity: "critical" | "warning" | "watch";
}

export interface RevenueTrendPoint {
  week: string;
  revenue: number;
  orders: number;
}

export interface SuggestedAction {
  priority: number;
  action: string;
  rationale: string;
  owner: string;
}

export interface DailyBriefing {
  generatedAt: string;
  greeting: string;
  summary: string;
  keyMetrics: KeyMetric[];
  attentionItems: AttentionItem[];
  inventoryRisks: InventoryRisk[];
  revenueTrend: RevenueTrendPoint[];
  revenueWoWChange: number;
  suggestedActions: SuggestedAction[];
}
