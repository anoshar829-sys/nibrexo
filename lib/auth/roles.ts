export const APP_ROLES = ["customer", "owner", "admin"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && (APP_ROLES as readonly string[]).includes(value);
}

export function isStaffRole(role: AppRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function roleFromProfile(value: unknown): AppRole {
  return isAppRole(value) ? value : "customer";
}
