import { ClientOnly } from "@/shared/ui/ClientOnly";
import { HomeApp } from "@/features/home/HomeApp";

export default function Page() {
  return (
    <ClientOnly>
      <HomeApp />
    </ClientOnly>
  );
}
