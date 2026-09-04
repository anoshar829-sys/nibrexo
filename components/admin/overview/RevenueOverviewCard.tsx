import { RevenueChart } from "@/components/admin/overview/RevenueChart";
import { formatMoney } from "@/lib/admin/format";
import { ADMIN_OVERVIEW_RANGE_META, type AdminOverviewRange, type RevenueSeries } from "@/lib/admin/overview";

export function RevenueOverviewCard({
  series,
  range,
}: Readonly<{
  series: RevenueSeries;
  range: AdminOverviewRange;
}>) {
  const meta = ADMIN_OVERVIEW_RANGE_META[range];
  const hasData = series.points.length > 0;
  const total = series.points.reduce((sum, point) => sum + point.totalCents, 0);

  return (
    <section className="dashboard-card dashboard-revenue" aria-labelledby="revenue-overview-title">
      <div className="dashboard-card__header">
        <div>
          <h2 id="revenue-overview-title">Revenue</h2>
          <p>{hasData ? `Paid sales in ${series.currency} · ${meta.label.toLowerCase()}` : "No sales yet"}</p>
        </div>
        {hasData ? <span className="dashboard-card__total">{formatMoney(total, series.currency)}</span> : null}
      </div>
      {hasData ? (
        <RevenueChart points={series.points} currency={series.currency} />
      ) : (
        <p className="dashboard-section-empty">
          No revenue yet. As soon as a customer completes a checkout, the sales trend for this period appears here.
        </p>
      )}
    </section>
  );
}
