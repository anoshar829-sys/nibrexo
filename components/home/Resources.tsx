import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/site";

export function Resources() {
  return (
    <section className="resources-section" id="resources" aria-labelledby="resources-title">
      <div className="container">
        <div className="resources-heading">
          <p className="eyebrow eyebrow--center">
            <span className="eyebrow-line" />
            03 / Learn With Nibrexo
          </p>
          <h2 id="resources-title">Resources &amp; Learning</h2>
          <p>Useful visual knowledge, guides, and free resources are shown here only when published.</p>
        </div>

        <div className="resource-grid">
          <article className="resource-card">
            <div className="resource-card__surface">
              <div className="resource-thumb resource-thumb--blog" aria-hidden="true">
                <span>BLOG / 01</span>
                <div className="blog-thumb__lines">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <b />
              </div>
              <div className="resource-card__body">
                <p className="resource-label">
                  <span>BLOG</span>
                  <span>ARTICLE PENDING</span>
                </p>
                <h3>Content release pending</h3>
                <p>Published article preview</p>
                <span className="resource-status">APPROVED CONTENT PENDING</span>
              </div>
            </div>
          </article>
          <article className="resource-card">
            <div className="resource-card__surface">
              <div className="resource-thumb resource-thumb--guide" aria-hidden="true">
                <span>GUIDE / 02</span>
                <div className="guide-thumb__page">
                  <i />
                  <i />
                  <i />
                  <b />
                </div>
                <em />
              </div>
              <div className="resource-card__body">
                <p className="resource-label">
                  <span>GUIDE</span>
                  <span>GUIDE PENDING</span>
                </p>
                <h3>Content release pending</h3>
                <p>Published guide preview</p>
                <span className="resource-status">APPROVED CONTENT PENDING</span>
              </div>
            </div>
          </article>
          <article className="resource-card">
            <div className="resource-card__surface">
              <div className="resource-thumb resource-thumb--free" aria-hidden="true">
                <span>FREE / 03</span>
                <div className="free-thumb__block" />
                <i />
                <b />
              </div>
              <div className="resource-card__body">
                <p className="resource-label">
                  <span>FREE RESOURCE</span>
                  <span>RELEASE PENDING</span>
                </p>
                <h3>Lead resource pending</h3>
                <p>Free download preview</p>
                <span className="resource-status">APPROVED CONTENT PENDING</span>
              </div>
            </div>
          </article>
        </div>

        <div className="resources-action">
          <Link className="text-action" href={routes.resources}>
            Explore Resources <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
