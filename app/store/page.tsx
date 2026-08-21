import type { Metadata } from "next";
import { StoreCatalog } from "@/components/store/StoreCatalog";
import { products } from "@/lib/content/products";
import { CheckBoxIcon } from "@/components/ui/Icons";

export const metadata: Metadata = {
  title: "Digital Products — Nibrexo",
  description: "Explore Nibrexo digital product releases.",
  openGraph: {
    title: "Digital Products — Nibrexo",
    description: "Explore Nibrexo digital product releases.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Products — Nibrexo",
    description: "Explore Nibrexo digital product releases.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
};

export default function StorePage() {
  return (
    <main id="main-content">
      <section className="store-intro">
        <div className="store-container">
          <div className="store-intro__grid">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                Nibrexo / Digital Products
              </p>
              <h1>Digital Products</h1>
            </div>
            <p>
              Explore individual Nibrexo product releases. Product visuals, details, pricing, and purchase availability
              are published with each approved release.
            </p>
          </div>
          <p className="digital-delivery-note">
            <CheckBoxIcon />
            Digital products are delivered digitally. No physical items are shipped unless clearly stated.
          </p>
        </div>
      </section>

      <section className="store-discovery" aria-labelledby="collection-title">
        <div className="store-container">
          <div className="store-filter-bar" aria-label="Product category navigation">
            <span className="store-filter-bar__label">Browse products</span>
            <div className="store-filter-bar__state">
              <span className="filter-pill is-active">ALL PRODUCTS</span>
              <span className="filter-pill">CATEGORIES AVAILABLE WITH RELEASES</span>
            </div>
          </div>
          <StoreCatalog products={products} />
        </div>
      </section>
    </main>
  );
}
