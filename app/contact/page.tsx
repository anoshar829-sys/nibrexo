import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact/ContactForm";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Nibrexo",
  description: "Approved Nibrexo contact details appear here when configured.",
  openGraph: {
    title: "Contact — Nibrexo",
    description: "Approved Nibrexo contact details appear here when configured.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
};

export default function ContactPage() {
  return (
    <main className="resources-main" id="main-content">
      <section className="page-hero">
        <div className="business-container page-hero__grid">
          <div>
            <p className="eyebrow">
              <span className="eyebrow-line" />
              Nibrexo / Support
            </p>
            <h1>Contact</h1>
          </div>
          <p>Contact details are shown only when approved contact information is configured.</p>
        </div>
      </section>
      <section className="resources-directory">
        <div className="business-container">
          <section className="public-content-state">
            <h2>Contact details pending</h2>
            <p>
              No email address, phone number, address, or social account is displayed until approved information is
              configured. You can review the FAQ or use your authenticated Customer Support area when available.
            </p>
            <div className="business-actions">
              <Link className="button button--outline" href={routes.faq}>
                View FAQ
              </Link>
              <Link className="button button--outline" href={routes.login}>
                Customer Support
              </Link>
            </div>
          </section>
          <div className="contact-panel">
            <div>
              <p className="eyebrow">
                <span className="eyebrow-line" />
                Message
              </p>
              <h2>Send a message</h2>
              <p>The form is ready for later configuration. Submitting it does not send or store a message.</p>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
