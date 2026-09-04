// Pure catalog query helpers shared by the Products UI and tests.
// No runtime imports: loadable by the bare Node test runner and safe on the
// client. A future server-side (Supabase) source can apply the same
// filter/sort semantics in SQL; these functions define the contract.

import type { AdminProduct, AdminProductStats, AdminProductStatus } from "./products.ts";

export type AdminProductStatusFilter = "all" | AdminProductStatus;

export const ADMIN_PRODUCT_SORT_KEYS = ["name", "price", "sales", "revenue", "updated"] as const;
export type AdminProductSortKey = (typeof ADMIN_PRODUCT_SORT_KEYS)[number];

export type AdminProductSort = {
  key: AdminProductSortKey;
  direction: "asc" | "desc";
};

export const DEFAULT_ADMIN_PRODUCT_SORT: AdminProductSort = { key: "updated", direction: "desc" };

export function isAdminProductSortKey(value: unknown): value is AdminProductSortKey {
  return typeof value === "string" && (ADMIN_PRODUCT_SORT_KEYS as readonly string[]).includes(value);
}

export function computeAdminProductStats(products: AdminProduct[]): AdminProductStats {
  let published = 0;
  let drafts = 0;
  let archived = 0;
  let unitsSold = 0;
  let revenueCents = 0;

  for (const product of products) {
    if (product.status === "published") published += 1;
    else if (product.status === "draft") drafts += 1;
    else archived += 1;
    unitsSold += product.unitsSold;
    revenueCents += product.revenueCents;
  }

  return { total: products.length, published, drafts, archived, unitsSold, revenueCents };
}

export function countProductsByStatus(products: AdminProduct[]): Record<AdminProductStatusFilter, number> {
  const stats = computeAdminProductStats(products);
  return {
    all: stats.total,
    published: stats.published,
    draft: stats.drafts,
    archived: stats.archived,
  };
}

export function filterAdminProducts(
  products: AdminProduct[],
  filter: { query: string; status: AdminProductStatusFilter },
): AdminProduct[] {
  const query = filter.query.trim().toLowerCase();

  return products.filter((product) => {
    if (filter.status !== "all" && product.status !== filter.status) {
      return false;
    }
    if (!query) {
      return true;
    }
    return (
      product.name.toLowerCase().includes(query) ||
      product.slug.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  });
}

function compareByKey(a: AdminProduct, b: AdminProduct, key: AdminProductSortKey): number {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name);
    case "price":
      // Products without a price sort as the lowest value.
      return (a.priceCents ?? -1) - (b.priceCents ?? -1);
    case "sales":
      return a.unitsSold - b.unitsSold;
    case "revenue":
      return a.revenueCents - b.revenueCents;
    case "updated":
      return a.updatedAt.localeCompare(b.updatedAt);
  }
}

export function sortAdminProducts(products: AdminProduct[], sort: AdminProductSort): AdminProduct[] {
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...products].sort((a, b) => {
    const primary = compareByKey(a, b, sort.key) * factor;
    if (primary !== 0) {
      return primary;
    }
    // Stable, deterministic tie-breaker.
    return a.name.localeCompare(b.name);
  });
}
