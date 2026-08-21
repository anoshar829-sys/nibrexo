import { ProductCard } from "@/components/store/ProductCard";
import type { StoreProduct } from "@/lib/content/products";

type ProductGridProps = {
  products: StoreProduct[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (!products.length) {
    return null;
  }

  return (
    <div className="product-grid" aria-live="polite">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
