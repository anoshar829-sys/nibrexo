// Range selection for the admin Overview. Pure module: importable from both
// the Next.js bundle and the bare Node test runner.

export const ADMIN_OVERVIEW_RANGES = ["7d", "30d", "90d", "12m"] as const;
export type AdminOverviewRange = (typeof ADMIN_OVERVIEW_RANGES)[number];
export const DEFAULT_ADMIN_OVERVIEW_RANGE: AdminOverviewRange = "30d";

export const ADMIN_OVERVIEW_RANGE_META: Record<
  AdminOverviewRange,
  { label: string; shortLabel: string; previousLabel: string }
> = {
  "7d": { label: "Last 7 days", shortLabel: "7 days", previousLabel: "Previous 7 days" },
  "30d": { label: "Last 30 days", shortLabel: "30 days", previousLabel: "Previous 30 days" },
  "90d": { label: "Last 90 days", shortLabel: "90 days", previousLabel: "Previous 90 days" },
  "12m": { label: "Last 12 months", shortLabel: "12 months", previousLabel: "Previous 12 months" },
};

export function parseAdminOverviewRange(value: unknown): AdminOverviewRange {
  return typeof value === "string" && (ADMIN_OVERVIEW_RANGES as readonly string[]).includes(value)
    ? (value as AdminOverviewRange)
    : DEFAULT_ADMIN_OVERVIEW_RANGE;
}
