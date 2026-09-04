import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDemoAdminOverview } from "./demo-source.ts";
import {
  ADMIN_OVERVIEW_RANGES,
  DEFAULT_ADMIN_OVERVIEW_RANGE,
  parseAdminOverviewRange,
  type AdminOverviewRange,
} from "./ranges.ts";
import type { AdminOverviewSnapshot } from "./overview.ts";
import {
  formatCompactMoney,
  formatCount,
  formatMoney,
  formatOrderDate,
  formatShortDate,
  formatSignedPercent,
  trendDirection,
} from "./format.ts";

const FIXED_NOW = new Date("2026-09-03T14:32:10Z");

const EXPECTED_POINTS: Record<AdminOverviewRange, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 13,
  "12m": 12,
};

const SAMPLE_DAYS = [
  "2026-09-03T08:00:00Z",
  "2026-09-04T22:15:00Z",
  "2026-01-01T00:00:00Z",
  "2026-06-30T12:00:00Z",
  "2027-02-28T18:45:00Z",
];

function snapshots(): AdminOverviewSnapshot[] {
  const all: AdminOverviewSnapshot[] = [];
  for (const day of SAMPLE_DAYS) {
    for (const range of ADMIN_OVERVIEW_RANGES) {
      all.push(buildDemoAdminOverview(range, new Date(day)));
    }
  }
  return all;
}

describe("admin overview range parsing", () => {
  it("accepts known ranges and falls back to the default", () => {
    for (const range of ADMIN_OVERVIEW_RANGES) {
      assert.equal(parseAdminOverviewRange(range), range);
    }
    assert.equal(parseAdminOverviewRange("99999d"), DEFAULT_ADMIN_OVERVIEW_RANGE);
    assert.equal(parseAdminOverviewRange(""), DEFAULT_ADMIN_OVERVIEW_RANGE);
    assert.equal(parseAdminOverviewRange(undefined), DEFAULT_ADMIN_OVERVIEW_RANGE);
    assert.equal(parseAdminOverviewRange(30), DEFAULT_ADMIN_OVERVIEW_RANGE);
  });
});

describe("demo overview source", () => {
  it("is deterministic for the same range and day", () => {
    const first = buildDemoAdminOverview("30d", FIXED_NOW);
    const second = buildDemoAdminOverview("30d", new Date("2026-09-03T23:59:59Z"));
    assert.equal(first.generatedAt, FIXED_NOW.toISOString());
    assert.equal(second.generatedAt, "2026-09-03T23:59:59.000Z");
    const { generatedAt: _firstTimestamp, ...firstData } = first;
    const { generatedAt: _secondTimestamp, ...secondData } = second;
    assert.deepEqual(firstData, secondData);
  });

  it("labels itself as demo data and echoes the range", () => {
    for (const range of ADMIN_OVERVIEW_RANGES) {
      const snapshot = buildDemoAdminOverview(range, FIXED_NOW);
      assert.equal(snapshot.source, "demo");
      assert.equal(snapshot.range, range);
      assert.equal(snapshot.currency, "USD");
      assert.equal(snapshot.generatedAt, FIXED_NOW.toISOString());
    }
  });

  it("builds the expected number of ordered, non-negative revenue buckets", () => {
    for (const snapshot of snapshots()) {
      assert.equal(snapshot.revenue.points.length, EXPECTED_POINTS[snapshot.range]);
      let previousIso = "";
      for (const point of snapshot.revenue.points) {
        assert.ok(point.label.length > 0, "bucket label must not be empty");
        assert.ok(Number.isInteger(point.totalCents) && point.totalCents >= 0);
        assert.ok(Number.isInteger(point.orders) && (point.orders ?? 0) >= 0);
        assert.ok(point.isoDate > previousIso, "buckets must ascend by date");
        previousIso = point.isoDate;
      }
    }
  });

  it("keeps revenue KPI equal to the sum of the series", () => {
    for (const snapshot of snapshots()) {
      const total = snapshot.revenue.points.reduce((sum, point) => sum + point.totalCents, 0);
      assert.equal(snapshot.kpis.revenue.totalCents, total);
    }
  });

  it("keeps order KPI equal to the sum of bucket orders and status totals", () => {
    for (const snapshot of snapshots()) {
      const orders = snapshot.revenue.points.reduce((sum, point) => sum + (point.orders ?? 0), 0);
      const { pending, processing, completed, cancelled } = snapshot.orderStatusTotals;
      assert.equal(snapshot.kpis.orders.total, orders);
      assert.equal(pending + processing + completed + cancelled, orders);
      for (const value of [pending, processing, completed, cancelled]) {
        assert.ok(Number.isInteger(value) && value >= 0);
      }
      assert.equal(snapshot.kpis.licenses.issuedInRange, completed);
    }
  });

  it("keeps customer and license KPIs sane", () => {
    for (const snapshot of snapshots()) {
      const { customers, licenses } = snapshot.kpis;
      assert.ok(Number.isInteger(customers.total) && customers.total > 0);
      assert.ok(Number.isInteger(customers.newInRange) && customers.newInRange >= 0);
      assert.ok(customers.newInRange <= customers.total);
      assert.ok(Number.isInteger(licenses.active) && licenses.active >= 0);
    }
  });

  it("returns recent orders newest-first with valid fields", () => {
    for (const snapshot of snapshots()) {
      assert.ok(snapshot.recentOrders.length <= 6);
      assert.ok(snapshot.recentOrders.length <= Math.max(0, snapshot.kpis.orders.total));
      const references = new Set<string>();
      let previousTimestamp = Number.POSITIVE_INFINITY;
      let previousReference = Number.POSITIVE_INFINITY;
      for (const order of snapshot.recentOrders) {
        assert.match(order.reference, /^NX-\d+$/);
        assert.equal(references.has(order.reference), false, "references must be unique");
        references.add(order.reference);
        const referenceNumber = Number(order.reference.slice(3));
        assert.ok(referenceNumber < previousReference, "references must descend with recency");
        previousReference = referenceNumber;
        assert.ok(order.customerName.length > 0);
        assert.ok(order.productName.length > 0);
        assert.ok(Number.isInteger(order.amountCents) && order.amountCents > 0);
        assert.ok(["pending", "processing", "completed", "cancelled"].includes(order.status));
        const timestamp = Date.parse(order.placedAt);
        assert.ok(Number.isFinite(timestamp));
        assert.ok(timestamp <= previousTimestamp, "orders must descend by placedAt");
        previousTimestamp = timestamp;
      }
    }
  });

  it("returns top products sorted by revenue with consistent math and shares under 100%", () => {
    for (const snapshot of snapshots()) {
      const products = snapshot.topProducts;
      assert.ok(products.length <= 5);
      let previousRevenue = Number.POSITIVE_INFINITY;
      let shareSum = 0;
      let revenueSum = 0;
      for (const product of products) {
        assert.ok(product.unitsSold >= 1);
        assert.equal(product.revenueCents, product.unitsSold * product.unitPriceCents);
        assert.ok(product.revenueCents <= previousRevenue, "products must descend by revenue");
        previousRevenue = product.revenueCents;
        shareSum += product.revenueSharePercent;
        revenueSum += product.revenueCents;
      }
      assert.ok(shareSum <= 100.5, `share sum ${shareSum} must not exceed 100%`);
      assert.ok(revenueSum <= snapshot.kpis.revenue.totalCents, "top products cannot exceed total revenue");
    }
  });
});

describe("admin formatting helpers", () => {
  it("formats money with cents only when needed", () => {
    assert.equal(formatMoney(123456, "USD"), "$1,234.56");
    assert.equal(formatMoney(123400, "USD"), "$1,234");
    assert.equal(formatMoney(0, "USD"), "$0");
  });

  it("formats compact money for chart axes", () => {
    assert.equal(formatCompactMoney(123456, "USD"), "$1.2K");
    assert.equal(formatCompactMoney(0, "USD"), "$0");
  });

  it("formats counts and signed percentages", () => {
    assert.equal(formatCount(12345), "12,345");
    assert.equal(formatSignedPercent(12.34), "+12.3%");
    assert.equal(formatSignedPercent(-3), "-3.0%");
    assert.equal(formatSignedPercent(0), "0.0%");
    assert.equal(trendDirection(4.2), "up");
    assert.equal(trendDirection(-4.2), "down");
    assert.equal(trendDirection(0), "flat");
    assert.equal(trendDirection(null), "flat");
  });

  it("formats dates deterministically in UTC", () => {
    assert.equal(formatShortDate("2026-09-03"), "Sep 3");
    assert.equal(formatOrderDate("2026-09-03T23:30:00.000Z"), "Sep 3, 2026");
    assert.equal(formatShortDate("not-a-date"), "not-a-date");
  });
});
