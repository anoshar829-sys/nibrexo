// Admin Overview data contract.
//
// This module is the single seam between the admin UI and business data.
// Today it resolves to a deterministic demo source because the store schema
// (products, orders, customers, licenses) has not been migrated to Supabase
// yet. When that schema lands, implement an `AdminOverviewSource` backed by
// Supabase queries and assign it to `activeSource` below — no UI change
// should be required.

import { demoAdminOverviewSource } from "./demo-source.ts";

export {
  ADMIN_OVERVIEW_RANGES,
  ADMIN_OVERVIEW_RANGE_META,
  DEFAULT_ADMIN_OVERVIEW_RANGE,
  parseAdminOverviewRange,
  type AdminOverviewRange,
} from "./ranges.ts";

import type { AdminOverviewRange } from "./ranges.ts";

/** "demo" is clearly labelled sample data; "live" means real persisted data. */
export type AdminOverviewDataSourceId = "demo" | "live";

export type RevenuePoint = {
  /** Axis label, e.g. "Sep 3" or "Oct". */
  label: string;
  /** ISO day (YYYY-MM-DD) the bucket starts on. */
  isoDate: string;
  totalCents: number;
  /** Paid orders inside the bucket, when the source can provide it. */
  orders?: number;
};

export type RevenueSeries = {
  currency: string;
  points: RevenuePoint[];
};

export type AdminOrderStatus = "pending" | "processing" | "completed" | "cancelled";

export type AdminOrderStatusTotals = Record<AdminOrderStatus, number>;

export type AdminRecentOrder = {
  reference: string;
  customerName: string;
  customerEmail: string | null;
  productName: string;
  amountCents: number;
  currency: string;
  status: AdminOrderStatus;
  /** ISO timestamp. */
  placedAt: string;
};

export type AdminTopProduct = {
  id: string;
  name: string;
  unitPriceCents: number;
  unitsSold: number;
  revenueCents: number;
  currency: string;
  /** Share of total range revenue, 0–100, one decimal. */
  revenueSharePercent: number;
};

export type AdminOverviewKpis = {
  revenue: { totalCents: number; changePercent: number | null };
  orders: { total: number; changePercent: number | null };
  customers: { total: number; newInRange: number; changePercent: number | null };
  licenses: { active: number; issuedInRange: number; changePercent: number | null };
};

export type AdminOverviewSnapshot = {
  range: AdminOverviewRange;
  source: AdminOverviewDataSourceId;
  generatedAt: string;
  currency: string;
  kpis: AdminOverviewKpis;
  revenue: RevenueSeries;
  orderStatusTotals: AdminOrderStatusTotals;
  recentOrders: AdminRecentOrder[];
  topProducts: AdminTopProduct[];
};

export type AdminOverviewSource = (range: AdminOverviewRange) => Promise<AdminOverviewSnapshot>;

// Swap this single line when the Supabase-backed source is implemented:
// const activeSource: AdminOverviewSource = supabaseAdminOverviewSource;
const activeSource: AdminOverviewSource = demoAdminOverviewSource;

export async function getAdminOverview(range: AdminOverviewRange): Promise<AdminOverviewSnapshot> {
  return activeSource(range);
}
