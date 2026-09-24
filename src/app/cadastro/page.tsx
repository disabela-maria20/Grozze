import type { Metadata } from "next";
import { ClientOnly } from "@/shared/ui/ClientOnly";
import { LoginPageApp } from "@/features/auth/LoginPageApp";

export const metadata: Metadata = { title: "Criar conta" };

export default function Page() {
  return (
    <ClientOnly>
      <LoginPageApp signup={true} />
    </ClientOnly>
  );
}
