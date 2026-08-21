import type { Metadata } from "next";
import { ResourcesCatalog } from "@/components/resources/ResourcesCatalog";
import { resources } from "@/lib/content/resources";

export const metadata: Metadata = {
  title: "Resources & Learning — Nibrexo",
  description: "Nibrexo resources and learning.",
  openGraph: {
    title: "Resources & Learning — Nibrexo",
    description: "Nibrexo resources and learning.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resources & Learning — Nibrexo",
    description: "Nibrexo resources and learning.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
};

export default function ResourcesPage() {
  return (
    <main className="resources-main" id="main-content">
      <section className="page-hero">
        <div className="business-container page-hero__grid">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-line" />
              Nibrexo / Learning
            </p>
            <h1>Resources &amp; Learning</h1>
          </div>
          <p>Useful visual knowledge and resource releases are published here when approved content is available.</p>
        </div>
      </section>

      <section className="resources-directory" aria-labelledby="resources-directory-title">
        <div className="business-container">
          <div className="resources-directory__intro">
            <h2 id="resources-directory-title">A place for useful visual knowledge, without filler.</h2>
            <p>
              Articles, guides, and free resources are shown only when their approved content is ready. No draft
              articles, guides, or downloads are represented as published resources.
            </p>
          </div>
          <ResourcesCatalog items={resources} />
        </div>
      </section>
    </main>
  );
}
