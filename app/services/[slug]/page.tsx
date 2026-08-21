import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PendingPage } from "@/components/layout/PendingPage";
import { serviceAreas } from "@/lib/content/services";

type ServiceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceAreas.find((item) => item.slug === slug);
  return {
    title: service ? `${service.name} — Nibrexo` : "Service — Nibrexo",
    description: "Published Nibrexo service information.",
  };
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
  const { slug } = await params;
  const service = serviceAreas.find((item) => item.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <PendingPage
      title={service.name}
      description="This service detail page is not migrated yet. Approved scope, deliverables, timelines, and pricing will appear here when published."
    />
  );
}
