export type ServiceArea = {
  id: string;
  slug: string;
  name: string;
  index: string;
  visualClass: "identity" | "web" | "product";
  visualLabel: string;
  description: string;
  status: string;
};

export const serviceAreas: ServiceArea[] = [
  {
    id: "brand-identity",
    slug: "brand-identity",
    name: "Brand Identity",
    index: "01",
    visualClass: "identity",
    visualLabel: "SERVICE VISUAL / 01",
    description: "Approved service details are required for this field.",
    status: "SCOPE PENDING",
  },
  {
    id: "web-design",
    slug: "web-design",
    name: "Web Design",
    index: "02",
    visualClass: "web",
    visualLabel: "SERVICE VISUAL / 02",
    description: "Approved service details are required for this field.",
    status: "SCOPE PENDING",
  },
  {
    id: "product-design",
    slug: "product-design",
    name: "Product Design",
    index: "03",
    visualClass: "product",
    visualLabel: "SERVICE VISUAL / 03",
    description: "Approved service details are required for this field.",
    status: "SCOPE PENDING",
  },
];
