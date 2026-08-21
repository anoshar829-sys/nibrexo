import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/site";

export function FinalCta() {
  return (
    <section className="final-cta-section" id="final-cta" aria-labelledby="final-cta-title">
      <div className="final-cta__structure" aria-hidden="true">
        <span />
        <span />
        <i />
      </div>
      <div className="container final-cta__content">
        <p className="eyebrow eyebrow--light">
          <span className="eyebrow-line" />
          07 / The Next Step
        </p>
        <h2 id="final-cta-title">Ready to see what you can build?</h2>
        <p>Browse the store, or talk to us about something custom.</p>
        <Link className="button button--light" href={routes.store}>
          Explore Products <ArrowIcon />
        </Link>
      </div>
    </section>
  );
}
