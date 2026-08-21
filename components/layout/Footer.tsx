import Image from "next/image";
import Link from "next/link";
import { BackToTop } from "@/components/layout/BackToTop";
import { routes } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <Link className="footer-logo" href={routes.homeTop} aria-label="Nibrexo home">
            <Image
              src="/assets/nibrexo-footer-dark.png"
              alt="Nibrexo"
              width={170}
              height={45}
            />
          </Link>
          <p>Visual understanding through purposeful visual systems.</p>
        </div>
        <div className="footer-link-groups">
          <nav aria-label="Products">
            <h3>Product</h3>
            <Link href={routes.store}>Browse Products</Link>
            <Link href={routes.cart}>Cart</Link>
          </nav>
          <nav aria-label="Services">
            <h3>Services</h3>
            <Link href={routes.services}>Our Services</Link>
            <a href={routes.portfolio}>Portfolio</a>
          </nav>
          <nav aria-label="Company">
            <h3>Company</h3>
            <Link href={routes.about}>About</Link>
            <a href={routes.faq}>Support</a>
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
      <div className="container footer-bottom">
        <p>© 2026 Nibrexo. All rights reserved.</p>
        <BackToTop />
      </div>
    </footer>
  );
}
