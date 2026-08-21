"use client";

import { usePathname } from "next/navigation";
import { routes } from "@/lib/site";

export function StoreSkipLink() {
  const pathname = usePathname();
  const label = pathname === routes.cart ? "Skip to cart" : "Skip to products";

  return (
    <a className="skip-link" href="#main-content">
      {label}
    </a>
  );
}
