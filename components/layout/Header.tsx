"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AccountIcon,
  ArrowIcon,
  CartIcon,
  CloseIcon,
  MenuIcon,
} from "@/components/ui/Icons";
import { routes } from "@/lib/site";

const NAV = [
  { href: routes.store, label: "Products" },
  { href: routes.services, label: "Services" },
  { href: routes.resources, label: "Resources" },
  { href: routes.about, label: "About" },
  { href: routes.legal, label: "Legal" },
] as const;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const headerClass = [
    "site-header",
    scrolled ? "is-scrolled" : "",
    menuOpen ? "is-menu-open" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={headerClass}>
      <div className="nav-wrap">
        <Link className="brand-link" href={routes.homeTop} aria-label="Nibrexo home" onClick={closeMenu}>
          <Image
            className="brand-logo"
            src="/assets/nibrexo-primary-header.png"
            alt="Nibrexo"
            width={151}
            height={40}
            priority
          />
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {NAV.map((item) => (
            <Link
              key={item.label}
              className={
                pathname === item.href || (pathname === "/" && item.href === routes.store)
                  ? "nav-link nav-link--primary"
                  : "nav-link"
              }
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <Link className="utility-button desktop-utility" href={routes.login} aria-label="Account">
            <AccountIcon />
          </Link>
          <Link className="utility-button desktop-utility" href={routes.cart} aria-label="Cart">
            <CartIcon />
          </Link>
          <Link className="button button--small nav-cta" href={routes.store}>
            <span>Explore Products</span>
            <ArrowIcon />
          </Link>
          <button
            className="menu-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon />
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="mobile-menu" id="mobile-menu" aria-hidden={!menuOpen}>
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
          <Link href={routes.login} onClick={closeMenu}>
            Account <span>06</span>
          </Link>
          <Link href={routes.cart} onClick={closeMenu}>
            Cart <span>07</span>
          </Link>
        </nav>
        <Link className="button button--primary mobile-menu__cta" href={routes.store} onClick={closeMenu}>
          Explore Products
        </Link>
      </div>
    </header>
  );
}
