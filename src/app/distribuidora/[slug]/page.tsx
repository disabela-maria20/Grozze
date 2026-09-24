import type { Metadata } from "next";
import { ClientOnly } from "@/shared/ui/ClientOnly";
import { DistributorPage } from "@/features/distributors/DistributorPage";
import { DISTRIBUTORS } from "@/shared/lib/catalog";

export function generateStaticParams() {
  return DISTRIBUTORS.filter((d) => d.status === "active" && d.public).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = DISTRIBUTORS.find((x) => x.slug === slug);
  return { title: d?.name };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <ClientOnly>
      <DistributorPage slug={slug} />
    </ClientOnly>
  );
}
