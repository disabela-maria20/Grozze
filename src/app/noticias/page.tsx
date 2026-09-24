import type { Metadata } from "next";
import { ClientOnly } from "@/shared/ui/ClientOnly";
import { NewsListApp } from "@/features/news/NewsListApp";

export const metadata: Metadata = { title: "Notícias" };

export default function Page() {
  return (
    <ClientOnly>
      <NewsListApp />
    </ClientOnly>
  );
}
