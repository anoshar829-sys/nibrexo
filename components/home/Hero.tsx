import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";
import { routes } from "@/lib/site";

export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero-grid container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Digital Products <span aria-hidden="true">·</span> Creative Design
          </p>
          <h1 id="hero-title">
            Thoughtfully built digital products for brands that care about the{" "}
            <span className="editorial-accent">details.</span>
          </h1>
          <p className="hero-lede">
            Nibrexo creates premium templates, tools, and creative work for founders
            and teams who don&apos;t want to compromise on quality — browse the store,
            or bring us your next project.
          </p>
          <div className="hero-actions">
            <Link className="button button--primary" href={routes.store}>
              <span>Explore Products</span>
              <ArrowIcon />
            </Link>
            <Link className="button button--outline" href={routes.services}>
              View Services
            </Link>
          </div>
          <Link className="text-action" href={routes.resources}>
            Or explore free resources <ArrowIcon />
          </Link>
          <p className="trust-note">
            <span className="trust-check" aria-hidden="true">
              ✓
            </span>
            Instant download. Clear licensing. No surprises.
          </p>
        </div>

        <div className="hero-visual" aria-label="Nibrexo visual system preview">
          <div className="visual-cap visual-cap--top">
            <span>VISUAL SYSTEM / 01</span>
            <span>CURATED PREVIEW</span>
          </div>
          <div className="visual-frame">
            <div className="frame-grid" aria-hidden="true" />
            <div className="preview-card preview-card--back" aria-hidden="true">
              <div className="preview-card__bar" />
              <div className="preview-card__copy">
                <span />
                <span />
                <span />
              </div>
              <div className="preview-card__blocks">
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className="preview-card preview-card--main">
              <div className="preview-card__top">
                <span className="tiny-label">PRODUCT FRAME</span>
                <span className="tiny-status">01</span>
              </div>
              <div className="fold-mark-wrap">
                <Image src="/assets/nibrexo-icon.png" alt="" width={104} height={141} />
              </div>
              <div className="main-preview-copy">
                <span className="tiny-label">VISUAL UNDERSTANDING</span>
                <span className="main-preview-line" />
                <span className="main-preview-line main-preview-line--short" />
              </div>
            </div>
            <div className="preview-card preview-card--front" aria-hidden="true">
              <div className="front-card__top">
                <span />
                <span />
              </div>
              <div className="front-card__circle" />
              <div className="front-card__text">
                <i />
                <i />
                <i />
              </div>
              <div className="front-card__footer">
                <span>Layout</span>
                <span>System</span>
              </div>
            </div>
            <div className="visual-rule visual-rule--v" aria-hidden="true" />
            <div className="visual-rule visual-rule--h" aria-hidden="true" />
          </div>
          <div className="visual-cap visual-cap--bottom">
            <span>HIERARCHY</span>
            <span className="visual-cap__dot" />
            <span>CLARITY</span>
            <span className="visual-cap__dot" />
            <span>PURPOSE</span>
          </div>
        </div>
      </div>
      <a className="scroll-cue" href={routes.coreStory} aria-label="Scroll to the Nibrexo core story">
        <span />
        <small>SCROLL TO EXPLORE</small>
      </a>
    </section>
  );
}
