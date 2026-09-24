import type { Metadata } from "next";
import { ClientOnly } from "@/shared/ui/ClientOnly";
import { CinemaPage } from "@/features/cinemas/CinemaPage";
import { allCinemas, cinema } from "@/shared/lib/catalog";

export function generateStaticParams() {
  return allCinemas().map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = cinema(id);
  return { title: c?.name, description: c?.address };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ClientOnly>
      <CinemaPage id={id} />
    </ClientOnly>
  );
}
