export function DemoDataNotice() {
  return (
    <aside className="admin-demo-banner" aria-label="Data source notice">
      <span className="admin-demo-banner__mark" aria-hidden="true">
        i
      </span>
      <p>
        <strong>Sample data.</strong> Products, orders, customers, and licenses are not connected to the database yet,
        so every figure on this page is deterministic development sample data — not real business numbers. Live
        metrics appear here automatically once the store schema is migrated to Supabase.
      </p>
    </aside>
  );
}
