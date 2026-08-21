import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/ui/Icons";
import { legalPolicies } from "@/lib/content/legal";

export const metadata: Metadata = {
  title: "Legal Center — Nibrexo",
  description: "Nibrexo Legal Center",
  openGraph: {
    title: "Legal Center — Nibrexo",
    description: "Nibrexo Legal Center",
    images: ["/assets/nibrexo-primary-header.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Legal Center — Nibrexo",
    description: "Nibrexo Legal Center",
    images: ["/assets/nibrexo-primary-header.png"],
  },
};

export default function LegalCenterPage() {
  return (
    <main>
      <section className="legal-hero">
        <div className="legal-container">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Nibrexo / Legal
          </p>
          <h1>Legal Center</h1>
          <p>Access Nibrexo’s approved legal documents in one place.</p>
        </div>
      </section>
      <section className="legal-directory">
        <div className="legal-container">
          <div className="policy-grid">
            {legalPolicies.map((policy) => (
              <Link className="policy-card" href={`/legal/${policy.slug}`} key={policy.slug}>
                <span className="policy-card__number">{policy.number}</span>
                <h2>{policy.title}</h2>
                <p>{policy.cardSummary}</p>
                <span className="card-link">
                  Read Full Policy <ArrowIcon />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
