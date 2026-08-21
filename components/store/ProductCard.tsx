import Link from "next/link";
import type { StoreProduct } from "@/lib/content/products";

type ProductCardProps = {
  product: StoreProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const href = `/store/product/${encodeURIComponent(product.slug || product.id)}`;
  const price = product.priceLabel || product.price || "Price pending";

  return (
    <article className="product-card">
      <Link href={href} aria-label={`View ${product.name}`}>
        <div
          className={product.image ? "product-card__visual has-image" : "product-card__visual product-card__visual--fallback"}
          role="img"
          aria-label={product.image ? undefined : "IMAGE UNAVAILABLE"}
        >
          {product.image ? <img src={product.image} alt={product.imageAlt || product.name} /> : "IMAGE UNAVAILABLE"}
        </div>
        <div className="product-card__body">
          <div className="product-meta">
            <span>{product.category || "CATEGORY NOT PROVIDED"}</span>
            <span>{product.id}</span>
          </div>
          <h3>{product.name}</h3>
          <p>{product.shortDescription || "Approved description not provided."}</p>
          <div className="product-card__bottom">
            <span className="product-price">{price}</span>
            <span className="product-card__link">View Product</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
