import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PolicyDocument } from "@/components/legal/PolicyDocument";
import { getLegalPolicy, legalPolicies } from "@/lib/content/legal";

type LegalSlugPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: LegalSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = getLegalPolicy(slug);
  if (!policy) {
    return { title: "Legal — Nibrexo" };
  }
  return {
    title: `${policy.title} — Nibrexo`,
    description: policy.description,
  };
}

export default async function LegalSlugPage({ params }: LegalSlugPageProps) {
  const { slug } = await params;
  const policy = getLegalPolicy(slug) ?? legalPolicies.find((item) => item.slug === slug);

  if (!policy) {
    notFound();
  }

  return <PolicyDocument policy={policy} />;
}
