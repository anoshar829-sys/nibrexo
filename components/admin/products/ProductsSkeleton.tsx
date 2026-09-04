// Loading skeleton mirroring the real Products page dimensions, shown by
// app/admin/products/loading.tsx while the catalog is being fetched.

export function ProductsSkeleton() {
  return (
    <div role="status" aria-label="Loading products">
      <span className="sr-only">Loading products…</span>

      <header className="admin-page-header" aria-hidden="true">
        <div>
          <div className="admin-skeleton admin-skeleton--title" />
          <div className="admin-skeleton admin-skeleton--subtitle" />
        </div>
        <div className="admin-skeleton admin-skeleton--button" />
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

        <section aria-hidden="true">
          <div className="admin-toolbar">
            <div className="admin-skeleton admin-skeleton--search" />
            <div className="admin-skeleton admin-skeleton--pills" />
          </div>
          <div className="admin-skeleton admin-skeleton--count" />
          <div className="admin-skeleton-stack admin-skeleton-stack--table">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <span className="admin-skeleton admin-skeleton--row-lg" key={index} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
