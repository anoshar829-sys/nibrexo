import Image from "next/image";
import Link from "next/link";
import { signOut } from "@/app/account/actions";
import { ADMIN_NAVIGATION, ADMIN_NAV_PLANNED_HINT, adminRoleLabel, isAdminNavActive } from "@/lib/admin/navigation";
import { avatarSrc } from "@/lib/auth/avatars";
import { routes } from "@/lib/site";
import type { AdminShellProfile } from "@/components/admin/AdminShell";
import type { RefObject } from "react";

export function AdminSidebar({
  profile,
  pathname,
  sidebarRef,
  drawerHidden,
  closeHidden,
  onCloseDrawer,
  onNavigate,
}: Readonly<{
  profile: AdminShellProfile;
  pathname: string;
  sidebarRef: RefObject<HTMLElement | null>;
  drawerHidden: boolean;
  closeHidden: boolean;
  onCloseDrawer: () => void;
  onNavigate: () => void;
}>) {
  return (
    <aside
      className="admin-sidebar"
      id="admin-sidebar"
      aria-label="Administrator navigation"
      aria-hidden={drawerHidden || undefined}
      inert={drawerHidden}
      ref={sidebarRef as RefObject<HTMLElement>}
    >
      <button
        className="admin-drawer-close"
        type="button"
        aria-label="Close admin navigation"
        hidden={closeHidden}
        onClick={onCloseDrawer}
      >
        ×
      </button>
      <Link className="admin-sidebar__brand" href={routes.home} aria-label="Nibrexo home" onClick={onNavigate}>
        <Image src="/assets/nibrexo-footer-dark.png" alt="Nibrexo" width={165} height={70} priority />
      </Link>

      {ADMIN_NAVIGATION.map((section) => (
        <div className="admin-sidebar__block" key={section.title}>
          <p className="admin-sidebar__section">{section.title}</p>
          <nav aria-label={section.title}>
            {section.items.map((item) =>
              item.status === "ready" ? (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isAdminNavActive(pathname, item.href) ? "page" : undefined}
                  onClick={onNavigate}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  key={item.label}
                  className="admin-nav-planned"
                  aria-disabled="true"
                  title={ADMIN_NAV_PLANNED_HINT}
                >
                  {item.label}
                  <span className="admin-nav-soon">Soon</span>
                </span>
              ),
            )}
          </nav>
        </div>
      ))}

      <div className="admin-sidebar__footer">
        <div className="admin-sidebar__user">
          <span className="admin-sidebar__user-avatar">
            <Image src={avatarSrc(profile.avatarId)} alt="" width={34} height={34} />
          </span>
          <span className="admin-sidebar__user-meta">
            <span className="admin-sidebar__user-name">{profile.displayName}</span>
            <span className="admin-sidebar__user-role">
              <span className="admin-sidebar__role-dot" aria-hidden="true" />
              {adminRoleLabel(profile.role)} access
            </span>
          </span>
        </div>
        <form className="admin-sidebar__logout-form" action={signOut}>
          <button className="admin-sidebar__logout" type="submit">
            Log Out
          </button>
        </form>
      </div>
    </aside>
  );
}
