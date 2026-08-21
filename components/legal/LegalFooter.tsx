import Image from "next/image";
import Link from "next/link";
import { ChevronUpIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/site";

export function LegalFooter() {
  return (
    <footer className="legal-full-footer">
      <div className="legal-container legal-full-footer__top">
        <div className="legal-full-footer__brand">
          <Link href={routes.home} aria-label="Nibrexo home">
            <Image src="/assets/nibrexo-footer-dark.png" alt="Nibrexo" width={166} height={44} />
          </Link>
          <p>Visual understanding through purposeful visual systems.</p>
        </div>
        <div className="legal-full-footer__groups">
          <nav aria-label="Products">
            <h2>Product</h2>
            <Link href={routes.store}>Browse Products</Link>
            <Link href={routes.cart}>Cart</Link>
          </nav>
          <nav aria-label="Services">
            <h3>Services</h3>
            <Link href={routes.services}>Our Services</Link>
            <Link href={routes.portfolio}>Portfolio</Link>
          </nav>
          <nav aria-label="Company">
            <h3>Company</h3>
            <Link href={routes.about}>About</Link>
            <Link href={routes.faq}>Support</Link>
            <Link href={routes.contact}>Contact</Link>
          </nav>
          <nav aria-label="Resources">
            <h3>Resources</h3>
            <Link href={routes.resources}>Resources</Link>
          </nav>
          <nav aria-label="Legal">
            <h3>Legal</h3>
            <Link href={routes.legal}>Legal Center</Link>
            <Link href={routes.privacy}>Privacy Policy</Link>
            <Link href={routes.terms}>Terms &amp; Conditions</Link>
            <Link href={routes.refund}>Refund Policy</Link>
            <Link href={routes.license}>Digital Product License Agreement</Link>
            <Link href={routes.disclaimer}>Disclaimer</Link>
            <Link href={routes.cookies}>Cookie Policy</Link>
            <Link href={routes.copyright}>Copyright &amp; Trademark Policy</Link>
          </nav>
        </div>
      </div>
      <div className="legal-container legal-full-footer__bottom">
        <p>© 2026 Nibrexo. All rights reserved.</p>
        <a href="#top">
          Back to Top <ChevronUpIcon />
        </a>
      </div>
    </footer>
  );
}
