import Link from "next/link";
import { routes } from "@/lib/site";

export function AccountAuthFooter() {
  return (
    <footer className="account-auth-footer">
      <div className="account-container account-auth-footer__inner">
        <span>© 2026 Nibrexo. All rights reserved.</span>
        <nav className="footer-social-links" data-social-contact-links="" hidden aria-label="Social and contact links" />
        <Link href={routes.privacy}>Privacy Policy</Link>
      </div>
    </footer>
  );
}
