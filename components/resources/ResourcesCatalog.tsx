import Link from "next/link";
import { ResourceCard } from "@/components/resources/ResourceCard";
import type { ResourceItem } from "@/lib/content/resources";
import { routes } from "@/lib/site";

type ResourcesCatalogProps = {
  items?: ResourceItem[];
};

export function ResourcesCatalog({ items = [] }: ResourcesCatalogProps) {
  if (items.length) {
    return (
      <div className="public-content-grid">
        {items.map((item) => (
          <ResourceCard key={item.slug} resource={item} />
        ))}
      </div>
    );
  }

  return (
    <div className="resources-empty">
      <div className="resources-empty__visual" role="img" aria-label="Nibrexo resources visual placeholder">
        <span>RESOURCE LIBRARY</span>
        <div className="resources-empty__frame">
          <i />
          <i />
          <i />
          <b />
        </div>
      </div>
      <div className="resources-empty__copy">
        <p className="product-meta">
          <span>LIBRARY STATUS</span>
          <span>APPROVED CONTENT REQUIRED</span>
        </p>
        <h2>Resources appear here with their real context.</h2>
        <p>
          Each published item will include its approved category, title, description, and destination. Until then, the
          library remains intentionally clear.
        </p>
        <Link className="button button--outline resources-empty__action" href={routes.store}>
          Explore Products
        </Link>
        <span className="resources-empty__note">ARTICLES · GUIDES · FREE RESOURCES</span>
      </div>
    </div>
  );
}
