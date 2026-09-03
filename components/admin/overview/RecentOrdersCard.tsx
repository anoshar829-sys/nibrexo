import { AdminStatusPill } from "@/components/admin/AdminStatusPill";
import { PlannedAdminLink } from "@/components/admin/PlannedAdminLink";
import { formatCount, formatMoney, formatOrderDate } from "@/lib/admin/format";
import {
  ADMIN_OVERVIEW_RANGE_META,
  type AdminOrderStatusTotals,
  type AdminOverviewRange,
  type AdminRecentOrder,
} from "@/lib/admin/overview";

export function RecentOrdersCard({
  orders,
  statusTotals,
  range,
  currency,
}: Readonly<{
  orders: AdminRecentOrder[];
  statusTotals: AdminOrderStatusTotals;
  range: AdminOverviewRange;
  currency: string;
}>) {
  const meta = ADMIN_OVERVIEW_RANGE_META[range];
  const hasOrders = orders.length > 0;

  return (
    <section className="dashboard-card" aria-labelledby="orders-overview-title">
      <div className="dashboard-card__header">
        <div>
          <h2 id="orders-overview-title">Recent Orders</h2>
          <p>Latest checkout activity · {meta.label.toLowerCase()}</p>
        </div>
        <PlannedAdminLink label="View all orders" hint="The Orders management page is not built yet." />
      </div>

      <div className="dashboard-order-summary" aria-label="Order status summary">
        <span>
          <strong>{formatCount(statusTotals.pending)}</strong>Pending
        </span>
        <span>
          <strong>{formatCount(statusTotals.processing)}</strong>Processing
        </span>
        <span>
          <strong>{formatCount(statusTotals.completed)}</strong>Completed
        </span>
        <span>
          <strong>{formatCount(statusTotals.cancelled)}</strong>Cancelled
        </span>
      </div>

      {hasOrders ? (
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <caption className="sr-only">Most recent Nibrexo orders</caption>
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Customer</th>
                <th scope="col">Product</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.reference}>
                  <td>
                    <span className="dashboard-table__strong">{order.reference}</span>
                  </td>
                  <td>
                    <span className="dashboard-table__strong">{order.customerName}</span>
                    {order.customerEmail ? (
                      <span className="dashboard-table__sub">{order.customerEmail}</span>
                    ) : null}
                  </td>
                  <td>
                    <span className="dashboard-table__product" title={order.productName}>
                      {order.productName}
                    </span>
                  </td>
                  <td>{formatMoney(order.amountCents, order.currency || currency)}</td>
                  <td>
                    <AdminStatusPill status={order.status} />
                  </td>
                  <td>{formatOrderDate(order.placedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="dashboard-section-empty">
          No orders yet. When a customer completes a purchase, their order appears here with its payment and delivery
          status.
        </p>
      )}
    </section>
  );
}
