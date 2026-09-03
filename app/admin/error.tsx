"use client";

import Link from "next/link";
import { useEffect } from "react";
import { routes } from "@/lib/site";

// Non-technical error boundary for the admin Overview. The admin shell from
// the layout stays visible; only the dashboard area is replaced.
export default function AdminOverviewError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="admin-page" id="main-content">
      <div className="admin-page__inner">
        <section className="admin-guard">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Nibrexo Admin
          </p>
          <h1>Dashboard unavailable</h1>
          <p>
            We could not load the admin overview right now. Nothing was changed and no data was lost — this is usually
            a temporary connection problem.
          </p>
          <div className="admin-guard__actions">
            <button className="button button--primary" type="button" onClick={() => reset()}>
              Try again
            </button>
            <Link className="button button--outline" href={routes.account}>
              Back to account
            </Link>
          </div>
          {error.digest ? <p className="admin-error-ref">Reference: {error.digest}</p> : null}
        </section>
      </div>
    </main>
  );
}
