import type { AppRole } from "@/lib/auth/roles";
import { routes } from "@/lib/site";

export type AdminNavItem =
  | { label: string; href: string; status: "ready" }
  | { label: string; status: "planned" };

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

// Information architecture for the admin system. Only Overview is built;
// planned destinations render as non-interactive entries until their pages
// exist, so the navigation never dead-ends on a 404.
export const ADMIN_NAVIGATION: AdminNavSection[] = [
  {
    title: "Management",
    items: [
      { label: "Overview", href: routes.admin, status: "ready" },
      { label: "Products", href: routes.adminProducts, status: "ready" },
      { label: "Orders", status: "planned" },
      { label: "Customers", status: "planned" },
      { label: "Licenses", status: "planned" },
    ],
  },
  {
    title: "Platform",
    items: [
      { label: "Content", status: "planned" },
      { label: "Support", status: "planned" },
      { label: "Settings", status: "planned" },
    ],
  },
];

export const ADMIN_NAV_PLANNED_HINT = "Not built yet — this admin area arrives in a later release.";

export function isAdminNavActive(pathname: string, href: string): boolean {
  // Exact match only: future sub-pages register their own navigation entry.
  return pathname === href;
}

export function adminRoleLabel(role: AppRole): string {
  return role === "owner" ? "Owner" : "Admin";
}

export function adminBreadcrumb(pathname: string): string {
  const base = routes.admin;
  if (pathname === base || pathname === `${base}/`) {
    return "Admin / Overview";
  }
  const segments = pathname
    .slice(base.length)
    .split("/")
    .filter(Boolean);
  if (!segments.length) {
    return "Admin / Overview";
  }
  const leaf = segments[segments.length - 1]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
  return `Admin / ${leaf}`;
}
