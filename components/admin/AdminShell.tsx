"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import type { AvatarId } from "@/lib/auth/avatars";
import type { AppRole } from "@/lib/auth/roles";

export type AdminShellProfile = {
  displayName: string;
  email: string | null;
  role: AppRole;
  avatarId: AvatarId;
};

const DRAWER_MEDIA_QUERY = "(max-width: 960px)";

function focusableIn(sidebar: HTMLElement | null): HTMLElement[] {
  if (!sidebar) {
    return [];
  }
  return Array.from(sidebar.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")).filter(
    (element) => !element.hidden,
  );
}

export function AdminShell({
  profile,
  children,
}: Readonly<{
  profile: AdminShellProfile;
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [isDrawerViewport, setIsDrawerViewport] = useState(false);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Navigation changes close the mobile drawer.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // Body scroll lock mirrors the legacy prototype: body.admin-nav-open.
  useEffect(() => {
    document.body.classList.toggle("admin-nav-open", navOpen);
    return () => {
      document.body.classList.remove("admin-nav-open");
    };
  }, [navOpen]);

  // Track the drawer breakpoint; growing past it always closes the drawer.
  useEffect(() => {
    const media = window.matchMedia(DRAWER_MEDIA_QUERY);
    const sync = () => {
      setIsDrawerViewport(media.matches);
      if (!media.matches) {
        setNavOpen(false);
      }
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const closeNav = useCallback((restoreFocus: boolean) => {
    setNavOpen(false);
    if (restoreFocus) {
      toggleRef.current?.focus();
    }
  }, []);

  const toggleNav = useCallback(() => {
    setNavOpen((open) => {
      const next = !open;
      if (next) {
        window.requestAnimationFrame(() => {
          const [first] = focusableIn(sidebarRef.current);
          first?.focus();
        });
      } else {
        toggleRef.current?.focus();
      }
      return next;
    });
  }, []);

  // Escape closes the drawer; Tab stays trapped inside it while open.
  useEffect(() => {
    if (!navOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeNav(true);
        return;
      }
      if (event.key !== "Tab") {
        return;
      }
      const focusable = focusableIn(sidebarRef.current);
      if (!focusable.length) {
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !sidebarRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [navOpen, closeNav]);

  const drawerClosed = isDrawerViewport && !navOpen;

  return (
    <div className="admin-shell">
      <AdminSidebar
        profile={profile}
        pathname={pathname}
        sidebarRef={sidebarRef as RefObject<HTMLElement | null>}
        drawerHidden={drawerClosed}
        closeHidden={!navOpen}
        onCloseDrawer={() => closeNav(true)}
        onNavigate={() => closeNav(false)}
      />
      <div
        className="admin-drawer-backdrop"
        aria-hidden={!navOpen}
        onClick={() => closeNav(true)}
      />
      <div className="admin-main">
        <AdminTopbar
          profile={profile}
          pathname={pathname}
          navOpen={navOpen}
          toggleRef={toggleRef}
          onToggleNav={toggleNav}
        />
        {children}
      </div>
    </div>
  );
}
