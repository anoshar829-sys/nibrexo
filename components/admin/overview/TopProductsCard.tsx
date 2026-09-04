import { PlannedAdminLink } from "@/components/admin/PlannedAdminLink";
import { formatCount, formatMoney } from "@/lib/admin/format";
import { ADMIN_OVERVIEW_RANGE_META, type AdminOverviewRange, type AdminTopProduct } from "@/lib/admin/overview";

export function TopProductsCard({
  products,
  range,
  currency,
}: Readonly<{
  products: AdminTopProduct[];
  range: AdminOverviewRange;
  currency: string;
}>) {
  const meta = ADMIN_OVERVIEW_RANGE_META[range];
  const hasProducts = products.length > 0;

  return (
    <section className="dashboard-card" aria-labelledby="products-overview-title">
      <div className="dashboard-card__header">
        <div>
          <h2 id="products-overview-title">Top Products</h2>
          <p>Ranked by revenue · {meta.label.toLowerCase()}</p>
        </div>
        <PlannedAdminLink label="View all products" hint="The Products management page is not built yet." />
      </div>

      {hasProducts ? (
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <caption className="sr-only">Best selling products by revenue</caption>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Sales</th>
                <th scope="col">Revenue</th>
                <th scope="col">Share</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <span className="dashboard-table__strong" title={product.name}>
                      {product.name}
                    </span>
                  </td>
                  <td>{formatCount(product.unitsSold)}</td>
                  <td>{formatMoney(product.revenueCents, product.currency || currency)}</td>
                  <td>
                    <span className="dashboard-share">
                      <span className="dashboard-share__track" aria-hidden="true">
                        <span
                          className="dashboard-share__fill"
                          style={{ width: `${Math.min(100, Math.max(0, product.revenueSharePercent))}%` }}
                        />
                      </span>
                      <span className="dashboard-share__value">{product.revenueSharePercent.toFixed(1)}%</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="dashboard-section-empty">
          No product sales yet. Once your first orders are completed, this list shows which products drive revenue.
        </p>
      )}
    </section>
  );
}
