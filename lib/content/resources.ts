export type ResourceItem = {
  slug: string;
  title: string;
  category: string;
  summary: string | null;
  type: "blog" | "documentation" | "guide" | "free";
};

export const resources: ResourceItem[] = [];
