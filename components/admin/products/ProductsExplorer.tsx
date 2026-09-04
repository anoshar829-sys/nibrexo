"use client";

import { useMemo, useState } from "react";
import { ProductStatusPill } from "@/components/admin/ProductStatusPill";
import { formatCount, formatMoney, formatOrderDate } from "@/lib/admin/format";
import {
  countProductsByStatus,
  DEFAULT_ADMIN_PRODUCT_SORT,
  filterAdminProducts,
  sortAdminProducts,
  type AdminProductSort,
  type AdminProductSortKey,
  type AdminProductStatusFilter,
} from "@/lib/admin/product-query";
import type { AdminProduct } from "@/lib/admin/products";

const FILTERS: { value: AdminProductStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Drafts" },
  { value: "archived", label: "Archived" },
];

const SORT_DEFAULT_DIRECTION: Record<AdminProductSortKey, "asc" | "desc"> = {
  name: "asc",
  price: "desc",
  sales: "desc",
  revenue: "desc",
  updated: "desc",
};

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
}: Readonly<{
  label: string;
  sortKey: AdminProductSortKey;
  sort: AdminProductSort;
  onSort: (key: AdminProductSortKey) => void;
}>) {
  const active = sort.key === sortKey;
  return (
    <th scope="col" aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" className="admin-table__sort" onClick={() => onSort(sortKey)}>
        {label}
        <span className={`admin-table__sort-arrow${active ? " is-active" : ""}`} aria-hidden="true">
          {active ? (sort.direction === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

export function ProductsExplorer({
  products,
  currency,
}: Readonly<{
  products: AdminProduct[];
  currency: string;
}>) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AdminProductStatusFilter>("all");
  const [sort, setSort] = useState<AdminProductSort>(DEFAULT_ADMIN_PRODUCT_SORT);

  const counts = useMemo(() => countProductsByStatus(products), [products]);
  const visible = useMemo(
    () => sortAdminProducts(filterAdminProducts(products, { query, status }), sort),
    [products, query, status, sort],
  );

  const handleSort = (key: AdminProductSortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: SORT_DEFAULT_DIRECTION[key] },
    );
  };

  const clearFilters = () => {
    setQuery("");
    setStatus("all");
  };

  const filtersActive = query.trim() !== "" || status !== "all";

  const toggleActionLabel = (product: AdminProduct) =>
    product.status === "published" ? "Unpublish" : product.status === "draft" ? "Publish" : "Restore";

  return (
    <section className="admin-products-list" aria-label="Product catalog">
      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Search by name, slug, or category"
          aria-label="Search products"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="admin-filter-pills" role="group" aria-label="Filter products by status">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className="admin-filter-pill"
              aria-pressed={status === filter.value}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
              <span className="admin-filter-pill__count">{formatCount(counts[filter.value])}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="admin-results-count" role="status" aria-live="polite">
        Showing {formatCount(visible.length)} of {formatCount(products.length)} products
        {filtersActive ? " (filtered)" : ""}
      </p>

      {visible.length > 0 ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <caption className="sr-only">
              Nibrexo product catalog with status, pricing, and lifetime performance
            </caption>
            <thead>
              <tr>
                <SortHeader label="Product" sortKey="name" sort={sort} onSort={handleSort} />
                <th scope="col">Status</th>
                <SortHeader label="Price" sortKey="price" sort={sort} onSort={handleSort} />
                <SortHeader label="Sales" sortKey="sales" sort={sort} onSort={handleSort} />
                <SortHeader label="Revenue" sortKey="revenue" sort={sort} onSort={handleSort} />
                <SortHeader label="Updated" sortKey="updated" sort={sort} onSort={handleSort} />
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => (
                <tr key={product.id}>
                  <td>
                    <span className="admin-table__strong">{product.name}</span>
                    <span className="admin-table__sub">
                      {product.category} · /{product.slug}
                    </span>
                  </td>
                  <td>
                    <ProductStatusPill status={product.status} />
                  </td>
                  <td>{product.priceCents === null ? "—" : formatMoney(product.priceCents, product.currency || currency)}</td>
                  <td>{formatCount(product.unitsSold)}</td>
                  <td>{formatMoney(product.revenueCents, product.currency || currency)}</td>
                  <td>{formatOrderDate(product.updatedAt)}</td>
                  <td>
                    <span className="admin-table__actions">
                      <button
                        className="button--text"
                        type="button"
                        disabled
                        title="Product editing arrives with the products backend."
                      >
                        Edit
                      </button>
                      <button
                        className="button--text"
                        type="button"
                        disabled
                        title="The storefront product page is not live yet."
                      >
                        View
                      </button>
                      <button
                        className="button--text"
                        type="button"
                        disabled
                        title="Publishing connects once the products backend is live."
                      >
                        {toggleActionLabel(product)}
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-empty admin-empty--compact">
          <div className="admin-empty__inner">
            <h2>No matching products</h2>
            <p>
              No products match the current search or filter. Try a different term, or reset the list to show the full
              catalog.
            </p>
            {filtersActive ? (
              <button className="button button--outline" type="button" onClick={clearFilters}>
                Clear search and filters
              </button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
