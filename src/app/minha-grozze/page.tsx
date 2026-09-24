import type { Metadata } from "next";
import { ClientOnly } from "@/shared/ui/ClientOnly";
import { AccountApp } from "@/features/account/AccountApp";

export const metadata: Metadata = { title: "Minha Grozze" };

export default function Page() {
  return (
    <ClientOnly>
      <AccountApp part="" />
    </ClientOnly>
  );
}
