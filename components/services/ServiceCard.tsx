import Link from "next/link";
import type { ServiceArea } from "@/lib/content/services";

type ServiceCardProps = {
  service: ServiceArea;
};

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="service-card">
      <div
        className={`service-card__visual service-card__visual--${service.visualClass}`}
        role="img"
        aria-label={`${service.name} visual placeholder`}
      >
        <span>{service.visualLabel}</span>
      </div>
      <div className="service-card__body">
        <p className="service-card__meta">
          <span>SERVICE AREA</span>
          <span>{service.index}</span>
        </p>
        <h3>{service.name}</h3>
        <p>{service.description}</p>
        <span className="service-card__status">{service.status}</span>
        <Link className="button button--outline" href={`/services/${service.slug}`}>
          View Service
        </Link>
      </div>
    </article>
  );
}
