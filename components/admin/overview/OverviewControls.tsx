"use client";

import { useRouter } from "next/navigation";
import { ADMIN_OVERVIEW_RANGES, ADMIN_OVERVIEW_RANGE_META, type AdminOverviewRange } from "@/lib/admin/overview";
import { routes } from "@/lib/site";

export function OverviewControls({ range }: Readonly<{ range: AdminOverviewRange }>) {
  const router = useRouter();

  return (
    <div className="dashboard-header__actions">
      <label className="dashboard-period">
        <span className="sr-only">Dashboard period</span>
        <select
          aria-label="Dashboard period"
          value={range}
          onChange={(event) => {
            const next = event.target.value;
            router.replace(`${routes.admin}?range=${encodeURIComponent(next)}`);
          }}
        >
          {ADMIN_OVERVIEW_RANGES.map((option) => (
            <option key={option} value={option}>
              {ADMIN_OVERVIEW_RANGE_META[option].label}
            </option>
          ))}
        </select>
      </label>
      <button className="button button--outline" type="button" onClick={() => router.refresh()}>
        Refresh
      </button>
    </div>
  );
}
