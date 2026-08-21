import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PendingPage } from "@/components/layout/PendingPage";
import { resources } from "@/lib/content/resources";

type ResourceDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ResourceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const resource = resources.find((item) => item.slug === slug);
  return {
    title: resource ? `${resource.title} — Nibrexo` : "Resource — Nibrexo",
    description: "Published Nibrexo resource information.",
  };
}

export default async function ResourceDetailPage({ params }: ResourceDetailPageProps) {
  const { slug } = await params;
  const resource = resources.find((item) => item.slug === slug);

  if (!resource) {
    notFound();
  }

  return (
    <PendingPage
      title={resource.title}
      description="This resource detail page is not migrated yet. Approved articles, guides, and downloads will appear here when published."
    />
  );
}
