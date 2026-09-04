// Deterministic development sample data for the Admin Overview.
//
// IMPORTANT: every number produced here is a seeded development sample, never
// real business data. The UI labels snapshots from this source as demo data.
// Output is stable for a given (range, UTC day) so refreshes and tests are
// reproducible. Replace via `activeSource` in lib/admin/overview.ts once the
// Supabase store schema exists.

import type {
  AdminOrderStatus,
  AdminOrderStatusTotals,
  AdminOverviewRange,
  AdminOverviewSnapshot,
  AdminOverviewSource,
  AdminRecentOrder,
  AdminTopProduct,
  RevenuePoint,
} from "./overview.ts";
import { addUtcDays, hashSeed, isoDay, mulberry32, startOfUtcDay } from "./deterministic.ts";

const DEMO_CURRENCY = "USD";

type DemoProduct = { id: string; name: string; unitPriceCents: number };

const DEMO_PRODUCTS: DemoProduct[] = [
  { id: "prd-aurora", name: "Aurora Presentation Kit", unitPriceCents: 8900 },
  { id: "prd-nordic", name: "Nordic Icon Set", unitPriceCents: 3900 },
  { id: "prd-editorial", name: "Editorial UI Kit", unitPriceCents: 12900 },
  { id: "prd-brand", name: "Brand Identity Toolkit", unitPriceCents: 19900 },
  { id: "prd-motion", name: "Motion Slides Bundle", unitPriceCents: 7900 },
  { id: "prd-mockup", name: "Mockup Studio Device Pack", unitPriceCents: 5900 },
];

const DEMO_CUSTOMER_POOL: { name: string; email: string }[] = [
  { name: "Maya Lindqvist", email: "maya.lindqvist@example.com" },
  { name: "Omar Haddad", email: "omar.haddad@example.com" },
  { name: "Sofia Reyes", email: "sofia.reyes@example.com" },
  { name: "Jonas Weber", email: "jonas.weber@example.com" },
  { name: "Amara Okafor", email: "amara.okafor@example.com" },
  { name: "Lucas Moreau", email: "lucas.moreau@example.com" },
  { name: "Hannah Kim", email: "hannah.kim@example.com" },
  { name: "Diego Ferreira", email: "diego.ferreira@example.com" },
  { name: "Ines Laurent", email: "ines.laurent@example.com" },
  { name: "Noah Bergstrom", email: "noah.bergstrom@example.com" },
  { name: "Leila Mansour", email: "leila.mansour@example.com" },
  { name: "Erik Sorensen", email: "erik.sorensen@example.com" },
];

const RANGE_BUCKETS: Record<AdminOverviewRange, { count: number; kind: "day" | "week" | "month" }> = {
  "7d": { count: 7, kind: "day" },
  "30d": { count: 30, kind: "day" },
  "90d": { count: 13, kind: "week" },
  "12m": { count: 12, kind: "month" },
};

const RANGE_SPAN_DAYS: Record<AdminOverviewRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 91,
  "12m": 365,
};

function dayLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

function monthLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" }).format(date);
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function changePercent(current: number, previous: number): number | null {
  if (previous <= 0) {
    return null;
  }
  return round1(((current - previous) / previous) * 100);
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

type SeriesBucket = RevenuePoint & { orders: number };

function buildBuckets(range: AdminOverviewRange, anchorDay: Date, seedKey: string): SeriesBucket[] {
  const spec = RANGE_BUCKETS[range];
  const rand = mulberry32(hashSeed(`${seedKey}:${range}:${isoDay(anchorDay)}`));
  const buckets: SeriesBucket[] = [];

  for (let index = spec.count - 1; index >= 0; index -= 1) {
    let bucketStart: Date;
    let daysInBucket: number;
    let label: string;

    if (spec.kind === "day") {
      bucketStart = addUtcDays(anchorDay, -index);
      daysInBucket = 1;
      label = dayLabel(bucketStart);
    } else if (spec.kind === "week") {
      const weekEnd = addUtcDays(anchorDay, -index * 7);
      bucketStart = addUtcDays(weekEnd, -6);
      daysInBucket = 7;
      label = dayLabel(bucketStart);
    } else {
      bucketStart = new Date(Date.UTC(anchorDay.getUTCFullYear(), anchorDay.getUTCMonth() - index, 1));
      const nextMonth = new Date(Date.UTC(anchorDay.getUTCFullYear(), anchorDay.getUTCMonth() - index + 1, 1));
      daysInBucket = Math.round((nextMonth.getTime() - bucketStart.getTime()) / 86_400_000);
      label = monthLabel(bucketStart);
    }

    const position = (spec.count - index) / spec.count;
    const seasonal = 0.78 + 0.42 * Math.sin(position * Math.PI * 2);
    const growth = 1 + position * 0.35;
    const dailyRate = Math.max(0, (1.4 + 3.2 * rand()) * seasonal * growth);
    const orders = Math.round(dailyRate * daysInBucket);
    const averageTicketCents = 6200 + Math.round(rand() * 5200);

    buckets.push({
      label,
      isoDate: isoDay(bucketStart),
      totalCents: orders * averageTicketCents,
      orders,
    });
  }

  return buckets;
}

function splitStatuses(total: number, rand: () => number): AdminOrderStatusTotals {
  if (total <= 0) {
    return { pending: 0, processing: 0, completed: 0, cancelled: 0 };
  }
  const cancelled = Math.min(total, Math.round(total * (0.03 + rand() * 0.04)));
  const pending = Math.min(total - cancelled, Math.round(total * (0.04 + rand() * 0.05)));
  const processing = Math.min(total - cancelled - pending, Math.round(total * (0.06 + rand() * 0.06)));
  const completed = total - cancelled - pending - processing;
  return { pending, processing, completed, cancelled };
}

function buildRecentOrders(range: AdminOverviewRange, anchorDay: Date, ordersTotal: number, rand: () => number): AdminRecentOrder[] {
  const count = Math.min(6, ordersTotal);
  if (count <= 0) {
    return [];
  }

  const windowDays = Math.min(RANGE_SPAN_DAYS[range], 20);
  const stepDays = Math.max(1, Math.floor(windowDays / count));
  const statusBag: AdminOrderStatus[] = ["completed", "completed", "processing", "completed", "pending", "cancelled"];
  const orders: AdminRecentOrder[] = [];
  // References count downwards while we walk back in time, so the newest
  // order (index 0) always carries the highest reference number.
  let referenceCounter = 2400 + Math.floor(rand() * 500) + count * 3;

  for (let index = 0; index < count; index += 1) {
    // Walk backwards in time so order references stay chronological: the
    // newest order always carries the highest reference.
    const daysAgo = Math.min(windowDays - 1, index * stepDays + Math.floor(rand() * stepDays));
    const placed = addUtcDays(anchorDay, -daysAgo);
    placed.setUTCHours(Math.max(8, 18 - index), Math.floor(rand() * 60), 0, 0);
    const customer = DEMO_CUSTOMER_POOL[Math.floor(rand() * DEMO_CUSTOMER_POOL.length)];
    const product = DEMO_PRODUCTS[Math.floor(rand() * DEMO_PRODUCTS.length)];
    const quantity = rand() < 0.22 ? 2 : 1;
    referenceCounter -= 1 + Math.floor(rand() * 3);

    orders.push({
      reference: `NX-${referenceCounter}`,
      customerName: customer.name,
      customerEmail: customer.email,
      productName: quantity > 1 ? `${product.name} × ${quantity}` : product.name,
      amountCents: product.unitPriceCents * quantity,
      currency: DEMO_CURRENCY,
      status: statusBag[index % statusBag.length],
      placedAt: placed.toISOString(),
    });
  }

  return orders.sort((left, right) => right.placedAt.localeCompare(left.placedAt));
}

function buildTopProducts(revenueTotalCents: number, rand: () => number): AdminTopProduct[] {
  if (revenueTotalCents <= 0) {
    return [];
  }

  const targetCents = Math.round(revenueTotalCents * (0.68 + rand() * 0.12));
  const picks = [...DEMO_PRODUCTS].sort(() => rand() - 0.5).slice(0, 5);
  const weights = picks.map(() => 0.5 + rand());
  const weightTotal = sum(weights);

  const products = picks.map((product, index) => {
    const slice = (targetCents * weights[index]) / weightTotal;
    const unitsSold = Math.max(1, Math.round(slice / product.unitPriceCents));
    return {
      id: product.id,
      name: product.name,
      unitPriceCents: product.unitPriceCents,
      unitsSold,
      revenueCents: unitsSold * product.unitPriceCents,
      currency: DEMO_CURRENCY,
      revenueSharePercent: 0,
    };
  });

  products.sort((left, right) => right.revenueCents - left.revenueCents);

  return products.map((product) => ({
    ...product,
    revenueSharePercent: round1((product.revenueCents / revenueTotalCents) * 100),
  }));
}

export function buildDemoAdminOverview(range: AdminOverviewRange, now: Date = new Date()): AdminOverviewSnapshot {
  const anchorDay = startOfUtcDay(now);
  const previousAnchor =
    range === "12m"
      ? new Date(Date.UTC(anchorDay.getUTCFullYear(), anchorDay.getUTCMonth() - 12, anchorDay.getUTCDate()))
      : addUtcDays(anchorDay, -RANGE_SPAN_DAYS[range]);

  const current = buildBuckets(range, anchorDay, "current");
  const previous = buildBuckets(range, previousAnchor, "previous");

  const revenueTotalCents = sum(current.map((point) => point.totalCents));
  const previousRevenueTotalCents = sum(previous.map((point) => point.totalCents));
  const ordersTotal = sum(current.map((point) => point.orders));
  const previousOrdersTotal = sum(previous.map((point) => point.orders));

  const rand = mulberry32(hashSeed(`overview:${range}:${isoDay(anchorDay)}`));
  const orderStatusTotals = splitStatuses(ordersTotal, rand);
  const previousStatusTotals = splitStatuses(previousOrdersTotal, rand);

  const identity = mulberry32(hashSeed(`identity:${isoDay(anchorDay)}`));
  const customersTotal = 180 + Math.floor(identity() * 140);
  const newCustomers = Math.min(customersTotal, Math.max(0, Math.round(ordersTotal * (0.4 + 0.25 * identity()))));
  const previousNewCustomers = Math.max(0, Math.round(previousOrdersTotal * (0.4 + 0.25 * identity())));
  const licensesActive = Math.round(customersTotal * (1.05 + identity() * 0.2));

  const recentOrders = buildRecentOrders(range, anchorDay, ordersTotal, rand);
  const topProducts = buildTopProducts(revenueTotalCents, rand);

  return {
    range,
    source: "demo",
    generatedAt: now.toISOString(),
    currency: DEMO_CURRENCY,
    kpis: {
      revenue: {
        totalCents: revenueTotalCents,
        changePercent: changePercent(revenueTotalCents, previousRevenueTotalCents),
      },
      orders: {
        total: ordersTotal,
        changePercent: changePercent(ordersTotal, previousOrdersTotal),
      },
      customers: {
        total: customersTotal,
        newInRange: newCustomers,
        changePercent: changePercent(newCustomers, previousNewCustomers),
      },
      licenses: {
        active: licensesActive,
        issuedInRange: orderStatusTotals.completed,
        changePercent: changePercent(orderStatusTotals.completed, previousStatusTotals.completed),
      },
    },
    revenue: { currency: DEMO_CURRENCY, points: current },
    orderStatusTotals,
    recentOrders,
    topProducts,
  };
}

export const demoAdminOverviewSource: AdminOverviewSource = async (range) => buildDemoAdminOverview(range);
