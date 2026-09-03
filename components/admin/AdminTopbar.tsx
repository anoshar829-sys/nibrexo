import { AccountMenu } from "@/components/account/AccountMenu";
import { MenuIcon } from "@/components/ui/Icons";
import { adminBreadcrumb, adminRoleLabel } from "@/lib/admin/navigation";
import type { AdminShellProfile } from "@/components/admin/AdminShell";
import type { RefObject } from "react";

export function AdminTopbar({
  profile,
  pathname,
  navOpen,
  toggleRef,
  onToggleNav,
}: Readonly<{
  profile: AdminShellProfile;
  pathname: string;
  navOpen: boolean;
  toggleRef: RefObject<HTMLButtonElement | null>;
  onToggleNav: () => void;
}>) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar__group">
        <button
          className="admin-mobile-toggle"
          type="button"
          aria-expanded={navOpen}
          aria-controls="admin-sidebar"
          aria-label={navOpen ? "Close admin navigation" : "Open admin navigation"}
          onClick={onToggleNav}
          ref={toggleRef}
        >
          <MenuIcon />
        </button>
        <span className="admin-topbar__breadcrumb">{adminBreadcrumb(pathname)}</span>
      </div>
      <div className="admin-topbar__group">
        <span className="admin-topbar__state">{adminRoleLabel(profile.role)} session active</span>
        <AccountMenu
          signedIn
          loggedOutClassName="admin-topbar__fallback"
          profile={{ displayName: profile.displayName, avatarId: profile.avatarId }}
        />
      </div>
    </header>
  );
}
