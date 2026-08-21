"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AccountIcon, CartIcon, CloseIcon, MenuIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/site";

const NAV = [
  { href: routes.store, label: "Products" },
  { href: routes.services, label: "Services" },
  { href: routes.resources, label: "Resources" },
  { href: routes.about, label: "About" },
  { href: routes.legal, label: "Legal" },
] as const;

export function StoreHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const productsActive = pathname === routes.store;
  const cartActive = pathname === routes.cart;

  useEffect(() => {
    document.body.classList.toggle("is-menu-open", menuOpen);
    return () => document.body.classList.remove("is-menu-open");
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={menuOpen ? "store-header is-menu-open" : "store-header"}>
      <div className="store-container store-header__inner">
        <Link className="store-brand" href={routes.home} aria-label="Nibrexo home" onClick={closeMenu}>
          <Image src="/assets/nibrexo-primary-header.png" alt="Nibrexo" width={151} height={40} priority />
        </Link>
        <nav className="store-nav" aria-label="Primary navigation">
          {NAV.map((item) => (
            <Link
              key={item.label}
              className={item.href === routes.store && productsActive ? "is-active" : undefined}
              aria-current={item.href === routes.store && productsActive ? "page" : undefined}
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="store-utility">
          <Link className="store-icon-button" href={routes.login} aria-label="Account">
            <AccountIcon />
          </Link>
          <Link
            className="store-icon-button"
            href={routes.cart}
            aria-label="Cart"
            aria-current={cartActive ? "page" : undefined}
          >
            <CartIcon />
            <span className="cart-count" hidden>
              0
            </span>
          </Link>
          <button
            className="store-menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="store-menu"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon />
            <CloseIcon />
          </button>
        </div>
      </div>
      <div className="store-menu" id="store-menu" aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          <Link href={routes.store} onClick={closeMenu}>
            Products <span>01</span>
          </Link>
          <Link href={routes.services} onClick={closeMenu}>
            Services <span>02</span>
          </Link>
          <Link href={routes.resources} onClick={closeMenu}>
            Resources <span>03</span>
          </Link>
          <Link href={routes.about} onClick={closeMenu}>
            About <span>04</span>
          </Link>
          <Link href={routes.legal} onClick={closeMenu}>
            Legal <span>05</span>
          </Link>
          <Link href={routes.cart} onClick={closeMenu}>
            Cart <span>06</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
