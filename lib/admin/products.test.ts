import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildDemoAdminProducts } from "./products-demo-source.ts";
import {
  computeAdminProductStats,
  countProductsByStatus,
  DEFAULT_ADMIN_PRODUCT_SORT,
  filterAdminProducts,
  isAdminProductSortKey,
  sortAdminProducts,
  type AdminProductSort,
} from "./product-query.ts";
import { ADMIN_PRODUCT_STATUSES } from "./products.ts";
import type { AdminProduct } from "./products.ts";

const SAMPLE_DAYS = [
  "2026-09-04T09:00:00Z",
  "2026-09-05T23:30:00Z",
  "2026-01-01T00:00:00Z",
  "2027-03-15T12:00:00Z",
];

function makeProduct(overrides: Partial<AdminProduct> = {}): AdminProduct {
  return {
    id: "prd-test",
    name: "Test Product",
    slug: "test-product",
    category: "Testing",
    status: "published",
    priceCents: 1000,
    currency: "USD",
    unitsSold: 0,
    revenueCents: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    ...overrides,
  };
}

describe("demo products source", () => {
  it("is deterministic for the same UTC day", () => {
    const first = buildDemoAdminProducts(new Date("2026-09-04T09:00:00Z"));
    const second = buildDemoAdminProducts(new Date("2026-09-04T21:45:00Z"));
    const { generatedAt: _a, ...firstData } = first;
    const { generatedAt: _b, ...secondData } = second;
    assert.deepEqual(firstData, secondData);
  });

  it("labels itself as demo data", () => {
    const snapshot = buildDemoAdminProducts(new Date("2026-09-04T09:00:00Z"));
    assert.equal(snapshot.source, "demo");
    assert.equal(snapshot.currency, "USD");
  });

  it("produces a consistent catalog across sample days", () => {
    for (const day of SAMPLE_DAYS) {
      const snapshot = buildDemoAdminProducts(new Date(day));
      const now = new Date(day);
      assert.equal(snapshot.products.length, 14);

      const ids = new Set(snapshot.products.map((product) => product.id));
      const slugs = new Set(snapshot.products.map((product) => product.slug));
      assert.equal(ids.size, snapshot.products.length, "ids must be unique");
      assert.equal(slugs.size, snapshot.products.length, "slugs must be unique");

      let published = 0;
      let draft = 0;
      let archived = 0;
      for (const product of snapshot.products) {
        assert.ok((ADMIN_PRODUCT_STATUSES as readonly string[]).includes(product.status));
        if (product.status === "published") published += 1;
        if (product.status === "draft") draft += 1;
        if (product.status === "archived") archived += 1;

        assert.match(product.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
        assert.ok(product.name.length > 0);
        assert.ok(product.category.length > 0);
        assert.ok(Number.isInteger(product.priceCents) && (product.priceCents ?? 0) > 0);
        assert.ok(Number.isInteger(product.unitsSold) && product.unitsSold >= 0);
        assert.equal(product.revenueCents, product.unitsSold * (product.priceCents ?? 0));
        if (product.status === "draft") {
          assert.equal(product.unitsSold, 0, "drafts have no sales yet");
        } else {
          assert.ok(product.unitsSold > 0);
        }
        assert.ok(product.createdAt <= product.updatedAt, "created must precede updated");
        assert.ok(Date.parse(product.updatedAt) <= now.getTime());
      }

      assert.equal(published, 9);
      assert.equal(draft, 3);
      assert.equal(archived, 2);
      assert.equal(snapshot.stats.published, published);
      assert.equal(snapshot.stats.drafts, draft);
      assert.equal(snapshot.stats.archived, archived);
      assert.deepEqual(snapshot.stats, computeAdminProductStats(snapshot.products));
    }
  });
});

describe("product stats", () => {
  it("computes stats and status counts from products", () => {
    const products = [
      makeProduct({ id: "a", status: "published", unitsSold: 3, revenueCents: 3000 }),
      makeProduct({ id: "b", status: "draft", unitsSold: 0, revenueCents: 0 }),
      makeProduct({ id: "c", status: "archived", unitsSold: 1, revenueCents: 1000 }),
    ];
    assert.deepEqual(computeAdminProductStats(products), {
      total: 3,
      published: 1,
      drafts: 1,
      archived: 1,
      unitsSold: 4,
      revenueCents: 4000,
    });
    assert.deepEqual(countProductsByStatus(products), { all: 3, published: 1, draft: 1, archived: 1 });
    assert.deepEqual(computeAdminProductStats([]), {
      total: 0,
      published: 0,
      drafts: 0,
      archived: 0,
      unitsSold: 0,
      revenueCents: 0,
    });
  });
});

describe("product filtering", () => {
  const products = [
    makeProduct({ id: "a", name: "Aurora Presentation Kit", slug: "aurora-presentation-kit", category: "Presentation Kits", status: "published" }),
    makeProduct({ id: "b", name: "Nordic Icon Set", slug: "nordic-icon-set", category: "Icon Sets", status: "draft" }),
    makeProduct({ id: "c", name: "Editorial UI Kit", slug: "editorial-ui-kit", category: "UI Kits", status: "archived" }),
  ];

  it("matches name, slug, and category case-insensitively", () => {
    assert.deepEqual(filterAdminProducts(products, { query: "AURORA", status: "all" }).map((p) => p.id), ["a"]);
    assert.deepEqual(filterAdminProducts(products, { query: "nordic-icon", status: "all" }).map((p) => p.id), ["b"]);
    assert.deepEqual(filterAdminProducts(products, { query: "ui kits", status: "all" }).map((p) => p.id), ["c"]);
    assert.deepEqual(filterAdminProducts(products, { query: "  kit  ", status: "all" }).map((p) => p.id), ["a", "c"]);
    assert.deepEqual(filterAdminProducts(products, { query: "kit", status: "all" }).map((p) => p.id), ["a", "c"]);
    assert.deepEqual(filterAdminProducts(products, { query: "zzz", status: "all" }), []);
  });

  it("combines status filter with query", () => {
    assert.deepEqual(filterAdminProducts(products, { query: "", status: "published" }).map((p) => p.id), ["a"]);
    assert.deepEqual(filterAdminProducts(products, { query: "icon", status: "draft" }).map((p) => p.id), ["b"]);
    assert.deepEqual(filterAdminProducts(products, { query: "icon", status: "published" }), []);
    assert.deepEqual(filterAdminProducts(products, { query: "", status: "archived" }).map((p) => p.id), ["c"]);
    assert.equal(filterAdminProducts(products, { query: "", status: "all" }).length, 3);
  });
});

describe("product sorting", () => {
  it("validates sort keys", () => {
    assert.equal(isAdminProductSortKey("name"), true);
    assert.equal(isAdminProductSortKey("updated"), true);
    assert.equal(isAdminProductSortKey("bogus"), false);
    assert.deepEqual(DEFAULT_ADMIN_PRODUCT_SORT, { key: "updated", direction: "desc" });
  });

  it("sorts by every key in both directions without mutating input", () => {
    const products = [
      makeProduct({ id: "a", name: "Beta", priceCents: 500, unitsSold: 9, revenueCents: 4500, updatedAt: "2026-03-01T00:00:00.000Z" }),
      makeProduct({ id: "b", name: "alpha", priceCents: 1500, unitsSold: 2, revenueCents: 3000, updatedAt: "2026-01-01T00:00:00.000Z" }),
      makeProduct({ id: "c", name: "Gamma", priceCents: null, unitsSold: 5, revenueCents: 0, updatedAt: "2026-02-01T00:00:00.000Z" }),
    ];
    const originalOrder = products.map((product) => product.id);

    const by = (sort: AdminProductSort) => sortAdminProducts(products, sort).map((product) => product.id);
    assert.deepEqual(by({ key: "name", direction: "asc" }), ["b", "a", "c"]);
    assert.deepEqual(by({ key: "name", direction: "desc" }), ["c", "a", "b"]);
    assert.deepEqual(by({ key: "price", direction: "asc" }), ["c", "a", "b"], "null price sorts lowest");
    assert.deepEqual(by({ key: "price", direction: "desc" }), ["b", "a", "c"]);
    assert.deepEqual(by({ key: "sales", direction: "desc" }), ["a", "c", "b"]);
    assert.deepEqual(by({ key: "revenue", direction: "asc" }), ["c", "b", "a"]);
    assert.deepEqual(by({ key: "updated", direction: "desc" }), ["a", "c", "b"]);
    assert.deepEqual(by({ key: "updated", direction: "asc" }), ["b", "c", "a"]);
    assert.deepEqual(products.map((product) => product.id), originalOrder, "input must not mutate");
  });

  it("breaks ties deterministically by name", () => {
    const products = [
      makeProduct({ id: "a", name: "Zulu", revenueCents: 100 }),
      makeProduct({ id: "b", name: "Alpha", revenueCents: 100 }),
    ];
    assert.deepEqual(sortAdminProducts(products, { key: "revenue", direction: "desc" }).map((p) => p.name), [
      "Alpha",
      "Zulu",
    ]);
  });
});
