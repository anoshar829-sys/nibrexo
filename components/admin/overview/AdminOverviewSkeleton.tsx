// Loading skeleton that mirrors the real Overview layout dimensions, shown
// by app/admin/loading.tsx while the dashboard data is being fetched.

export function AdminOverviewSkeleton() {
  return (
    <div role="status" aria-label="Loading overview">
      <span className="sr-only">Loading dashboard…</span>

      <header className="dashboard-header">
        <div>
          <div className="admin-skeleton admin-skeleton--title" aria-hidden="true" />
          <div className="admin-skeleton admin-skeleton--subtitle" aria-hidden="true" />
        </div>
        <div className="admin-skeleton admin-skeleton--controls" aria-hidden="true" />
      </header>

      <div className="dashboard-content">
        <div className="dashboard-kpis" aria-hidden="true">
          {[0, 1, 2, 3].map((index) => (
            <div className="dashboard-kpi" key={index}>
              <span className="admin-skeleton admin-skeleton--circle" />
              <div className="dashboard-kpi__body">
                <span className="admin-skeleton admin-skeleton--label" />
                <span className="admin-skeleton admin-skeleton--value" />
                <span className="admin-skeleton admin-skeleton--note" />
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-card dashboard-revenue" aria-hidden="true">
          <div className="dashboard-card__header">
            <div>
              <span className="admin-skeleton admin-skeleton--card-title" />
              <span className="admin-skeleton admin-skeleton--label admin-skeleton--spaced" />
            </div>
            <span className="admin-skeleton admin-skeleton--total" />
          </div>
          <div className="admin-skeleton admin-skeleton--chart" />
        </div>

        <div className="dashboard-two-column" aria-hidden="true">
          <div className="dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <span className="admin-skeleton admin-skeleton--card-title" />
                <span className="admin-skeleton admin-skeleton--label admin-skeleton--spaced" />
              </div>
              <span className="admin-skeleton admin-skeleton--link" />
            </div>
            <div className="dashboard-order-summary admin-skeleton-summary">
              {[0, 1, 2, 3].map((index) => (
                <span className="admin-skeleton admin-skeleton--chip" key={index} />
              ))}
            </div>
            <div className="admin-skeleton-stack">
              {[0, 1, 2, 3, 4].map((index) => (
                <span className="admin-skeleton admin-skeleton--row" key={index} />
              ))}
            </div>
          </div>

          <div className="dashboard-card">
            <div className="dashboard-card__header">
              <div>
                <span className="admin-skeleton admin-skeleton--card-title" />
                <span className="admin-skeleton admin-skeleton--label admin-skeleton--spaced" />
              </div>
              <span className="admin-skeleton admin-skeleton--link" />
            </div>
            <div className="admin-skeleton-stack">
              {[0, 1, 2, 3, 4].map((index) => (
                <span className="admin-skeleton admin-skeleton--row" key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
