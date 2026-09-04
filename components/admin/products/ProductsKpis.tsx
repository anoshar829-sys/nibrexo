import { formatCount, formatMoney } from "@/lib/admin/format";
import type { AdminProductStats } from "@/lib/admin/products";

export function ProductsKpis({
  stats,
  currency,
}: Readonly<{
  stats: AdminProductStats;
  currency: string;
}>) {
  return (
    <section className="dashboard-kpis" aria-label="Catalog summary">
      <article className="dashboard-kpi">
        <span className="dashboard-kpi__icon" aria-hidden="true">
          P
        </span>
        <div className="dashboard-kpi__body">
          <span className="dashboard-kpi__label">Total Products</span>
          <strong className="dashboard-kpi__value">{formatCount(stats.total)}</strong>
          <span className="dashboard-kpi__note">Across all statuses</span>
        </div>
      </article>

      <article className="dashboard-kpi">
        <span className="dashboard-kpi__icon" aria-hidden="true">
          ✓
        </span>
        <div className="dashboard-kpi__body">
          <span className="dashboard-kpi__label">Published</span>
          <strong className="dashboard-kpi__value">{formatCount(stats.published)}</strong>
          <span className="dashboard-kpi__note">Marked live in the catalog</span>
        </div>
      </article>

      <article className="dashboard-kpi">
        <span className="dashboard-kpi__icon" aria-hidden="true">
          ✎
        </span>
        <div className="dashboard-kpi__body">
          <span className="dashboard-kpi__label">Drafts</span>
          <strong className="dashboard-kpi__value">{formatCount(stats.drafts)}</strong>
          <span className="dashboard-kpi__note">Not published yet</span>
        </div>
      </article>

      <article className="dashboard-kpi">
        <span className="dashboard-kpi__icon" aria-hidden="true">
          $
        </span>
        <div className="dashboard-kpi__body">
          <span className="dashboard-kpi__label">Lifetime Revenue</span>
          <strong className="dashboard-kpi__value">{formatMoney(stats.revenueCents, currency)}</strong>
          <span className="dashboard-kpi__note">{formatCount(stats.unitsSold)} lifetime sales</span>
        </div>
      </article>
    </section>
  );
}
