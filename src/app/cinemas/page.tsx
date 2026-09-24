import type { Metadata } from "next";
import { ClientOnly } from "@/shared/ui/ClientOnly";
import { CinemasApp } from "@/features/cinemas/CinemasApp";

export const metadata: Metadata = { title: "Cinemas" };

export default function Page() {
  return (
    <ClientOnly>
      <CinemasApp />
    </ClientOnly>
  );
}
