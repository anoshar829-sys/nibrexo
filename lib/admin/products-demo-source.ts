// Deterministic development sample catalog for the Admin Products page.
//
// IMPORTANT: every product, price, and sales figure here is seeded sample
// data for development, never real business data. The UI discloses snapshots
// from this source as demo data. Output is stable for a given UTC day.
// Replace via `activeSource` in lib/admin/products.ts once a Supabase-backed
// products source exists.
//
// The first six entries intentionally match the Admin Overview demo catalog
// (same ids, names, and prices) so both pages describe one sample world.

import { addUtcDays, hashSeed, isoDay, mulberry32, startOfUtcDay } from "./deterministic.ts";
import { computeAdminProductStats } from "./product-query.ts";
import type { AdminProduct, AdminProductsSnapshot, AdminProductsSource, AdminProductStatus } from "./products.ts";

const DEMO_CURRENCY = "USD";

type CatalogEntry = {
  id: string;
  name: string;
  category: string;
  priceCents: number;
};

const DEMO_CATALOG: CatalogEntry[] = [
  { id: "prd-aurora", name: "Aurora Presentation Kit", category: "Presentation Kits", priceCents: 8900 },
  { id: "prd-nordic", name: "Nordic Icon Set", category: "Icon Sets", priceCents: 3900 },
  { id: "prd-editorial", name: "Editorial UI Kit", category: "UI Kits", priceCents: 12900 },
  { id: "prd-brand", name: "Brand Identity Toolkit", category: "Branding", priceCents: 19900 },
  { id: "prd-motion", name: "Motion Slides Bundle", category: "Presentation Kits", priceCents: 7900 },
  { id: "prd-mockup", name: "Mockup Studio Device Pack", category: "Mockups", priceCents: 5900 },
  { id: "prd-meridian", name: "Meridian Dashboard Template", category: "Templates", priceCents: 14900 },
  { id: "prd-type-pairing", name: "Type Pairing Lab", category: "Fonts & Type", priceCents: 4900 },
  { id: "prd-portfolio", name: "Portfolio Case Study Kit", category: "Templates", priceCents: 9900 },
  { id: "prd-infographic", name: "Infographic Engine Pack", category: "Graphics", priceCents: 6900 },
  { id: "prd-social-launch", name: "Social Launch Kit", category: "Marketing Kits", priceCents: 3500 },
  { id: "prd-poster", name: "Print-Ready Poster Bundle", category: "Graphics", priceCents: 5400 },
  { id: "prd-notion-ops", name: "Notion Ops Workspace", category: "Productivity", priceCents: 2900 },
  { id: "prd-visual-story", name: "Visual Story Slides", category: "Presentation Kits", priceCents: 11900 },
];

const DEMO_ARCHIVED_COUNT = 2;
const DEMO_DRAFT_COUNT = 3;

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Seeded Fisher-Yates shuffle over catalog indexes. */
function shuffledIndexes(count: number, rand: () => number): number[] {
  const indexes = Array.from({ length: count }, (_, index) => index);
  for (let index = count - 1; index > 0; index -= 1) {
    const swap = Math.floor(rand() * (index + 1));
    [indexes[index], indexes[swap]] = [indexes[swap], indexes[index]];
  }
  return indexes;
}

function statusForPosition(position: number): AdminProductStatus {
  if (position < DEMO_ARCHIVED_COUNT) {
    return "archived";
  }
  if (position < DEMO_ARCHIVED_COUNT + DEMO_DRAFT_COUNT) {
    return "draft";
  }
  return "published";
}

export function buildDemoAdminProducts(now: Date = new Date()): AdminProductsSnapshot {
  const anchorDay = startOfUtcDay(now);
  const rand = mulberry32(hashSeed(`products:${isoDay(anchorDay)}`));
  const order = shuffledIndexes(DEMO_CATALOG.length, rand);

  const products: AdminProduct[] = DEMO_CATALOG.map((entry, entryIndex) => {
    const status = statusForPosition(order.indexOf(entryIndex));

    let unitsSold: number;
    if (status === "published") {
      unitsSold = 12 + Math.floor(rand() * 309);
    } else if (status === "archived") {
      unitsSold = 4 + Math.floor(rand() * 57);
    } else {
      unitsSold = 0;
    }

    const updated = addUtcDays(anchorDay, -Math.floor(rand() * 91));
    updated.setUTCHours(9 + Math.floor(rand() * 10), Math.floor(rand() * 60), 0, 0);
    const created = addUtcDays(updated, -(10 + Math.floor(rand() * 391)));

    return {
      id: entry.id,
      name: entry.name,
      slug: slugFromName(entry.name),
      category: entry.category,
      status,
      priceCents: entry.priceCents,
      currency: DEMO_CURRENCY,
      unitsSold,
      revenueCents: unitsSold * entry.priceCents,
      createdAt: created.toISOString(),
      updatedAt: updated.toISOString(),
    };
  });

  return {
    source: "demo",
    currency: DEMO_CURRENCY,
    products,
    stats: computeAdminProductStats(products),
    generatedAt: now.toISOString(),
  };
}

export const demoAdminProductsSource: AdminProductsSource = async () => buildDemoAdminProducts();
