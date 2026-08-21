import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/site";

type PendingPageProps = {
  title: string;
  description: string;
};

export function PendingPage({ title, description }: PendingPageProps) {
  return (
    <main id="main-content">
      <section className="pending-page" aria-labelledby="pending-title">
        <div className="container">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Page not migrated yet
          </p>
          <h1 id="pending-title">{title}</h1>
          <p>{description}</p>
          <div className="hero-actions">
            <Link className="button button--primary" href={routes.home}>
              <span>Back to homepage</span>
              <ArrowIcon />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
