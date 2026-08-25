"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { signOut } from "@/app/account/actions";
import { AccountIcon, ChevronDownIcon } from "@/components/ui/Icons";
import type { PublicProfileIdentity } from "@/lib/auth/profile";
import { routes } from "@/lib/site";
import "@/styles/account-menu.css";

type AccountMenuProps = {
  signedIn: boolean;
  loggedOutClassName: string;
  profile?: PublicProfileIdentity;
};

export function AccountMenu({ signedIn, loggedOutClassName, profile }: AccountMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [signedIn, pathname]);

  if (!signedIn) {
    return (
      <Link className={loggedOutClassName} href={routes.login} aria-label="Account">
        <AccountIcon />
      </Link>
    );
  }

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        className="account-menu__trigger"
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="account-menu__identity">
          {profile ? <span className="account-menu__name">{profile.displayName}</span> : null}
          <span className="account-menu__avatar">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" width={28} height={28} />
            ) : (
              <AccountIcon />
            )}
          </span>
        </span>
        <span className="account-menu__chevron">
          <ChevronDownIcon />
        </span>
      </button>
      {open ? (
        <div className="account-menu__panel" id={menuId} role="menu" aria-label="Account">
          <Link className="account-menu__item" href={routes.account} role="menuitem" onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link className="account-menu__item" href={routes.profile} role="menuitem" onClick={() => setOpen(false)}>
            Profile
          </Link>
          <form className="account-menu__form" action={signOut}>
            <button className="account-menu__item" type="submit" role="menuitem">
              Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
