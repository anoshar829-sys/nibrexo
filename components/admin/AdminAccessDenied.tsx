import Link from "next/link";
import { routes } from "@/lib/site";

export function AdminAccessDenied() {
  return (
    <main className="admin-standalone" id="main-content">
      <div className="admin-standalone__inner">
        <section className="admin-guard">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Nibrexo Admin
          </p>
          <h1>Access denied</h1>
          <p>
            This area is limited to Nibrexo owner and administrator accounts. Your customer account cannot open admin
            routes, and no admin data was loaded.
          </p>
          <div className="admin-guard__actions">
            <Link className="button button--primary" href={routes.account}>
              Return to account
            </Link>
            <Link className="button button--outline" href={routes.home}>
              Back to Nibrexo
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
