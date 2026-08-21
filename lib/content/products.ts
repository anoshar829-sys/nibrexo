export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  price: string | null;
  priceLabel: string | null;
  image: string | null;
  imageAlt?: string | null;
  category: string | null;
  availability: "pending" | "available";
};

export const products: StoreProduct[] = [];

export function availableProducts(list: StoreProduct[] = products) {
  return list.filter((product) => product.availability === "available" && product.id && product.name);
}
