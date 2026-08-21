import type { Metadata } from "next";
import Link from "next/link";
import { ServiceCard } from "@/components/services/ServiceCard";
import { serviceAreas } from "@/lib/content/services";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services — Nibrexo",
  description: "Nibrexo creative design services.",
  openGraph: {
    title: "Services — Nibrexo",
    description: "Nibrexo creative design services.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Services — Nibrexo",
    description: "Nibrexo creative design services.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
};

export default function ServicesPage() {
  return (
    <main className="services-main" id="main-content">
      <section className="page-hero">
        <div className="business-container page-hero__grid">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-line" />
              Nibrexo / Creative Design
            </p>
            <h1>Services</h1>
          </div>
          <p>Need something templates can’t cover? Our team designs it from scratch.</p>
        </div>
      </section>

      <section className="service-overview" aria-labelledby="service-overview-title">
        <div className="business-container">
          <div className="service-overview__intro">
            <h2 id="service-overview-title">A focused visual approach for work that needs more than a starting point.</h2>
            <p>
              The service areas below are part of the approved Nibrexo direction. Specific scope, deliverables, timelines,
              and pricing are shown only when they are approved.
            </p>
          </div>
          <div className="service-grid">
            {serviceAreas.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      <section className="approach-section" aria-labelledby="approach-title">
        <div className="business-container approach-layout">
          <div className="approach-copy">
            <p className="eyebrow eyebrow--light">
              <span className="eyebrow-line" />
              How Nibrexo Approaches the Work
            </p>
            <h2 id="approach-title">Visual structure should make the next step easier to understand.</h2>
            <p>Nibrexo communicates understanding through visual communication and purposeful visual systems.</p>
          </div>
          <div className="approach-visual" role="img" aria-label="Visual system approach diagram">
            <span className="approach-visual__line approach-visual__line--one" />
            <span className="approach-visual__line approach-visual__line--two" />
            <span className="approach-node approach-node--one">CONTEXT</span>
            <span className="approach-node approach-node--two">CLARITY</span>
            <span className="approach-node approach-node--three">SYSTEM</span>
          </div>
        </div>
      </section>

      <section className="process-section" aria-labelledby="process-title">
        <div className="business-container">
          <div className="section-heading">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              Process Outline
            </p>
            <h2 id="process-title">A clear sequence for custom work.</h2>
            <p>The approved process is shown at a high level. Detailed engagement information is added only with an approved service scope.</p>
          </div>
          <ol className="process-list">
            <li>
              <span className="process-list__number">01</span>
              <h3>Discover</h3>
              <p>Approved process detail pending.</p>
            </li>
            <li>
              <span className="process-list__number">02</span>
              <h3>Design</h3>
              <p>Approved process detail pending.</p>
            </li>
            <li>
              <span className="process-list__number">03</span>
              <h3>Build</h3>
              <p>Approved process detail pending.</p>
            </li>
            <li>
              <span className="process-list__number">04</span>
              <h3>Deliver</h3>
              <p>Approved process detail pending.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="context-block" aria-labelledby="services-next-title">
        <div className="business-container context-block__inner">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-line" />
              Relevant Work
            </p>
            <h2 id="services-next-title">Published work appears here with approved project context.</h2>
            <Link className="button button--outline" href={routes.portfolio}>
              View Portfolio
            </Link>
          </div>
          <p>Explore Nibrexo’s digital products while service and project information continues to be added through approved content.</p>
        </div>
      </section>
    </main>
  );
}
