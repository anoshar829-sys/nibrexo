import { KpiDelta } from "@/components/admin/overview/KpiDelta";
import { formatCount, formatMoney } from "@/lib/admin/format";
import { ADMIN_OVERVIEW_RANGE_META, type AdminOverviewKpis, type AdminOverviewRange } from "@/lib/admin/overview";

export function OverviewKpis({
  kpis,
  range,
  currency,
}: Readonly<{
  kpis: AdminOverviewKpis;
  range: AdminOverviewRange;
  currency: string;
}>) {
  const meta = ADMIN_OVERVIEW_RANGE_META[range];

  return (
    <section className="dashboard-kpis" aria-label="Key performance indicators">
      <article className="dashboard-kpi">
        <span className="dashboard-kpi__icon" aria-hidden="true">
          $
        </span>
        <div className="dashboard-kpi__body">
          <span className="dashboard-kpi__label">Total Revenue</span>
          <strong className="dashboard-kpi__value">{formatMoney(kpis.revenue.totalCents, currency)}</strong>
          <KpiDelta percent={kpis.revenue.changePercent} range={range} />
          <span className="dashboard-kpi__note">Paid sales · {meta.label.toLowerCase()}</span>
        </div>
      </article>

      <article className="dashboard-kpi">
        <span className="dashboard-kpi__icon" aria-hidden="true">
          O
        </span>
        <div className="dashboard-kpi__body">
          <span className="dashboard-kpi__label">Orders</span>
          <strong className="dashboard-kpi__value">{formatCount(kpis.orders.total)}</strong>
          <KpiDelta percent={kpis.orders.changePercent} range={range} />
          <span className="dashboard-kpi__note">Placed · {meta.label.toLowerCase()}</span>
        </div>
      </article>

      <article className="dashboard-kpi">
        <span className="dashboard-kpi__icon" aria-hidden="true">
          C
        </span>
        <div className="dashboard-kpi__body">
          <span className="dashboard-kpi__label">Customers</span>
          <strong className="dashboard-kpi__value">{formatCount(kpis.customers.total)}</strong>
          <KpiDelta percent={kpis.customers.changePercent} range={range} />
          <span className="dashboard-kpi__note">
            {formatCount(kpis.customers.newInRange)} new in {meta.shortLabel}
          </span>
        </div>
      </article>

      <article className="dashboard-kpi">
        <span className="dashboard-kpi__icon" aria-hidden="true">
          L
        </span>
        <div className="dashboard-kpi__body">
          <span className="dashboard-kpi__label">Active Licenses</span>
          <strong className="dashboard-kpi__value">{formatCount(kpis.licenses.active)}</strong>
          <KpiDelta percent={kpis.licenses.changePercent} range={range} />
          <span className="dashboard-kpi__note">
            {formatCount(kpis.licenses.issuedInRange)} issued in {meta.shortLabel}
          </span>
        </div>
      </article>
    </section>
  );
}
