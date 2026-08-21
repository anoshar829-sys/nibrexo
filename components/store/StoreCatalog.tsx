import Link from "next/link";
import { ProductGrid } from "@/components/store/ProductGrid";
import { availableProducts, type StoreProduct } from "@/lib/content/products";
import { routes } from "@/lib/site";

type StoreCatalogProps = {
  products?: StoreProduct[];
  status?: "loading" | "empty" | "ready";
};

export function StoreCatalog({ products = [], status }: StoreCatalogProps) {
  const published = availableProducts(products);
  const catalogStatus = status ?? (published.length ? "ready" : "empty");

  if (catalogStatus === "loading") {
    return (
      <section className="catalog-empty" aria-labelledby="collection-title" aria-busy="true">
        <div className="catalog-empty__visual" role="img" aria-label="Loading Nibrexo digital product catalogue">
          <span>PRODUCT CATALOGUE</span>
          <div className="catalog-empty__frame">
            <i />
            <i />
            <i />
            <b />
          </div>
          <div className="catalog-empty__object" />
        </div>
        <div className="catalog-empty__content">
          <p className="product-meta">
            <span>CATALOG STATUS</span>
            <span>LOADING RELEASES</span>
          </p>
          <h2 id="collection-title">Loading approved product releases.</h2>
          <p>Product visuals, details, pricing, and purchase availability appear here when approved releases are ready.</p>
          <span className="catalog-empty__note">DIGITAL PRODUCT COLLECTION</span>
        </div>
      </section>
    );
  }

  if (catalogStatus === "empty" || published.length === 0) {
    return (
      <section className="catalog-empty" aria-labelledby="collection-title">
        <div className="catalog-empty__visual" role="img" aria-label="Nibrexo digital product catalogue visual placeholder">
          <span>PRODUCT CATALOGUE</span>
          <div className="catalog-empty__frame">
            <i />
            <i />
            <i />
            <b />
          </div>
          <div className="catalog-empty__object" />
        </div>
        <div className="catalog-empty__content">
          <p className="product-meta">
            <span>CATALOG STATUS</span>
            <span>AWAITING APPROVED RELEASES</span>
          </p>
          <h2 id="collection-title">Approved product details are required before products are shown here.</h2>
          <p>
            To avoid representing a product inaccurately, no preview, price, specification, or purchase action is shown
            until actual product data is supplied.
          </p>
          <Link className="button button--outline catalog-empty__action" href={routes.resources}>
            Explore Resources
          </Link>
          <span className="catalog-empty__note">DIGITAL PRODUCT COLLECTION</span>
        </div>
      </section>
    );
  }

  return <ProductGrid products={published} />;
}
