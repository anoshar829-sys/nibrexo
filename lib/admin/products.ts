// Admin Products data contract.
//
// Mirrors the Admin Overview seam: the UI only consumes typed snapshots from
// `getAdminProducts()`. The Supabase schema currently contains no products
// table (only `profiles`), so the active source is a deterministic, clearly
// labelled demo implementation. When a products backend exists, implement an
// `AdminProductsSource` against it and swap `activeSource` — no UI changes.

import type { AdminOverviewDataSourceId } from "./overview.ts";
import { demoAdminProductsSource } from "./products-demo-source.ts";

/** Same demo/live marker used across admin data sources. */
export type AdminProductsSourceId = AdminOverviewDataSourceId;

export const ADMIN_PRODUCT_STATUSES = ["published", "draft", "archived"] as const;
export type AdminProductStatus = (typeof ADMIN_PRODUCT_STATUSES)[number];

export const ADMIN_PRODUCT_STATUS_LABELS: Record<AdminProductStatus, string> = {
  published: "Published",
  draft: "Draft",
  archived: "Archived",
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  status: AdminProductStatus;
  /** null = no price set yet (draft behavior); render an em dash. */
  priceCents: number | null;
  currency: string;
  /** Lifetime units sold. */
  unitsSold: number;
  /** Lifetime revenue; equals unitsSold × priceCents for priced products. */
  revenueCents: number;
  /** ISO timestamps. */
  createdAt: string;
  updatedAt: string;
};

export type AdminProductStats = {
  total: number;
  published: number;
  drafts: number;
  archived: number;
  unitsSold: number;
  revenueCents: number;
};

export type AdminProductsSnapshot = {
  source: AdminProductsSourceId;
  currency: string;
  products: AdminProduct[];
  stats: AdminProductStats;
  generatedAt: string;
};

export type AdminProductsSource = () => Promise<AdminProductsSnapshot>;

// Swap this single line when the Supabase-backed source is implemented:
// const activeSource: AdminProductsSource = supabaseAdminProductsSource;
const activeSource: AdminProductsSource = demoAdminProductsSource;

export async function getAdminProducts(): Promise<AdminProductsSnapshot> {
  return activeSource();
}
