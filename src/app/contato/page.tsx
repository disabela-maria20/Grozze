import type { Metadata } from "next";
import { ClientOnly } from "@/shared/ui/ClientOnly";
import { ContactApp } from "@/features/contact/ContactApp";

export const metadata: Metadata = { title: "Contato" };

export default function Page() {
  return (
    <ClientOnly>
      <ContactApp newsletter={false} />
    </ClientOnly>
  );
}
