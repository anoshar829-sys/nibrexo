"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BackArrowIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/site";

export function LegalHeader() {
  const pathname = usePathname();
  const isIndex = pathname === routes.legal;

  return (
    <header className="legal-header">
      <div className="legal-container legal-header__inner">
        <Link className="legal-brand" href={routes.home} aria-label="Nibrexo home">
          <Image src="/assets/nibrexo-primary-header.png" alt="Nibrexo" width={148} height={40} priority />
        </Link>
        <Link className="return-link" href={isIndex ? routes.home : routes.legal}>
          <BackArrowIcon />
          {isIndex ? "Back to Nibrexo" : "Legal Center"}
        </Link>
      </div>
    </header>
  );
}
