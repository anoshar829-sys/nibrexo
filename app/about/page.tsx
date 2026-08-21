import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Nibrexo — Visual Understanding",
  description: "About Nibrexo and its visual communication philosophy.",
  openGraph: {
    title: "About Nibrexo — Visual Understanding",
    description: "About Nibrexo and its visual communication philosophy.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Nibrexo — Visual Understanding",
    description: "About Nibrexo and its visual communication philosophy.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
};

export default function AboutPage() {
  return (
    <main className="about-main" id="main-content">
      <section className="page-hero">
        <div className="business-container page-hero__grid">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-line" />
              About / Nibrexo
            </p>
            <h1>About Nibrexo</h1>
          </div>
          <p>Understanding through visual communication and purposeful visual systems.</p>
        </div>
      </section>

      <section className="about-intro" aria-labelledby="about-intro-title">
        <div className="business-container">
          <div className="about-intro__grid">
            <h2 id="about-intro-title">
              Nibrexo communicates understanding through visual communication and purposeful visual systems.
            </h2>
            <p>
              Nibrexo is built around a visual-first approach: clear hierarchy, deliberate spacing, and purposeful
              structure. The goal is not decoration for its own sake, but a more understandable experience.
            </p>
          </div>
          <div className="philosophy-panel">
            <div
              className="philosophy-panel__visual"
              role="img"
              aria-label="Visual communication system illustration"
            >
              <span>VISUAL PHILOSOPHY</span>
              <div className="philosophy-panel__frame">
                <i />
                <i />
                <i />
                <b />
              </div>
            </div>
            <div className="philosophy-panel__copy">
              <p className="eyebrow">
                <span className="eyebrow-line" />
                What Nibrexo Believes
              </p>
              <h3>Clarity comes before decoration.</h3>
              <p>
                Structured minimalism with quiet confidence keeps every screen focused on what matters. Visual interest
                is earned through precision, rhythm, and restraint.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="principles-section" aria-labelledby="principles-title">
        <div className="business-container">
          <div className="principles-heading">
            <p className="eyebrow eyebrow--center">
              <span className="eyebrow-line" />
              Principles
            </p>
            <h2 id="principles-title">A visual system should help people understand.</h2>
            <p>These principles guide the way Nibrexo communicates visually.</p>
          </div>
          <div className="principle-grid">
            <article className="principle">
              <span className="principle__number">01</span>
              <h3>Hierarchy before decoration</h3>
              <p>Visual structure ranks what matters before anything else competes for attention.</p>
            </article>
            <article className="principle">
              <span className="principle__number">02</span>
              <h3>Space is a hierarchy signal</h3>
              <p>Whitespace is used to create breathing room and show what deserves attention.</p>
            </article>
            <article className="principle">
              <span className="principle__number">03</span>
              <h3>Purpose over decoration</h3>
              <p>Every visual element should clarify state, hierarchy, or understanding.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="visual-system-section" aria-labelledby="visual-system-title">
        <div className="business-container visual-system-grid">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-line" />
              Visual Communication
            </p>
            <h2 id="visual-system-title">Give every idea a clear place.</h2>
            <p>
              Shape, spacing, typography, and sequence can guide attention before someone has to search for it. The page
              itself should make that principle easier to see.
            </p>
          </div>
          <div
            className="comparison-visual"
            role="img"
            aria-label="Comparison between unstructured information and clear visual hierarchy"
          >
            <div className="comparison-panel comparison-panel--before">
              <span className="comparison-panel__label">WITHOUT HIERARCHY</span>
              <i className="before-shape before-shape--one" />
              <i className="before-shape before-shape--two" />
              <i className="before-shape before-shape--three" />
            </div>
            <div className="comparison-divider">
              <span>→</span>
            </div>
            <div className="comparison-panel comparison-panel--after">
              <span className="comparison-panel__label">WITH PURPOSE</span>
              <i className="after-line after-line--heading" />
              <i className="after-line" />
              <i className="after-line after-line--short" />
              <b className="after-action" />
              <div className="after-dots">
                <i />
                <i />
                <i />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="final-block">
        <span className="final-shape final-shape--one" aria-hidden="true" />
        <span className="final-shape final-shape--two" aria-hidden="true" />
        <div className="business-container final-block__content">
          <p className="eyebrow eyebrow--light">
            <span className="eyebrow-line" />
            Nibrexo Digital Products
          </p>
          <h2>Explore what Nibrexo is building.</h2>
          <p>Browse Nibrexo digital product releases as approved products become available.</p>
          <Link className="button button--light" href={routes.store}>
            Explore Products <ArrowIcon />
          </Link>
        </div>
      </section>
    </main>
  );
}
