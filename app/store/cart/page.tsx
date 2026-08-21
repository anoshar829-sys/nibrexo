import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cart — Nibrexo",
  description: "Nibrexo digital product cart.",
  openGraph: {
    title: "Cart — Nibrexo",
    description: "Nibrexo digital product cart.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cart — Nibrexo",
    description: "Nibrexo digital product cart.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
};

export default function CartPage() {
  return (
    <main className="cart-page" id="main-content">
      <div className="store-container">
        <header className="cart-heading">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Nibrexo / Store
          </p>
          <h1>Your Cart</h1>
          <p>Digital products added from approved product releases are shown here.</p>
        </header>
        <section className="cart-shell" data-cart-view="">
          <div className="cart-empty" id="cart-empty">
            <div className="cart-empty__inner">
              <div className="cart-empty__visual" aria-hidden="true" />
              <span className="empty-kicker">CART IS READY</span>
              <h2>Your cart is currently empty.</h2>
              <p>No approved product releases are available to add at this time.</p>
              <Link className="button button--outline" href={routes.store}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
