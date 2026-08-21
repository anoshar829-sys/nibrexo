import Link from "next/link";
import type { ResourceItem } from "@/lib/content/resources";

type ResourceCardProps = {
  resource: ResourceItem;
};

export function ResourceCard({ resource }: ResourceCardProps) {
  const action = resource.type === "documentation" ? "Read Documentation" : "Read Post";

  return (
    <article className="public-content-card">
      <span className="public-content-card__meta">{resource.category || resource.type.toUpperCase()}</span>
      <h2>{resource.title}</h2>
      <p>{resource.summary || "Content details are available on this page."}</p>
      <Link href={`/resources/${encodeURIComponent(resource.slug)}`}>{action}</Link>
    </article>
  );
}
