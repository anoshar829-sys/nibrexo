import { formatSignedPercent, trendDirection } from "@/lib/admin/format";
import { ADMIN_OVERVIEW_RANGE_META, type AdminOverviewRange } from "@/lib/admin/overview";

const ARROWS = { up: "↑", down: "↓", flat: "→" } as const;

export function KpiDelta({
  percent,
  range,
}: Readonly<{
  percent: number | null;
  range: AdminOverviewRange;
}>) {
  const direction = trendDirection(percent);
  const comparison = ADMIN_OVERVIEW_RANGE_META[range].previousLabel.toLowerCase();

  if (percent === null) {
    return (
      <span className="dashboard-kpi__delta dashboard-kpi__delta--flat">
        <span aria-hidden="true">—</span>
        <span className="sr-only">No comparable {comparison} data yet</span>
      </span>
    );
  }

  return (
    <span className={`dashboard-kpi__delta dashboard-kpi__delta--${direction}`} title={`Versus ${comparison}`}>
      <span aria-hidden="true">{ARROWS[direction]}</span>
      {formatSignedPercent(percent)}
      <span className="sr-only"> versus {comparison}</span>
    </span>
  );
}
