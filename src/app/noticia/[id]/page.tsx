import type { Metadata } from "next";
import { ClientOnly } from "@/shared/ui/ClientOnly";
import { ArticleApp } from "@/features/news/ArticleApp";
import { NEWS } from "@/shared/lib/catalog";

export function generateStaticParams() {
  return NEWS.map((n) => ({ id: n.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const n = NEWS.find((x) => x.id === id);
  return { title: n?.t, description: n?.p };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ClientOnly>
      <ArticleApp id={id} />
    </ClientOnly>
  );
}
