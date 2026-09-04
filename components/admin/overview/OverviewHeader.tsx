import { OverviewControls } from "@/components/admin/overview/OverviewControls";
import { ADMIN_OVERVIEW_RANGE_META, type AdminOverviewRange } from "@/lib/admin/overview";

export function OverviewHeader({ range }: Readonly<{ range: AdminOverviewRange }>) {
  const meta = ADMIN_OVERVIEW_RANGE_META[range];

  return (
    <header className="dashboard-header">
      <div>
        <h1>Overview</h1>
        <p>How Nibrexo is performing — revenue, orders, customers, and licenses for the {meta.label.toLowerCase()}.</p>
      </div>
      <OverviewControls range={range} />
    </header>
  );
}
