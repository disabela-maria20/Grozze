import { ClientOnly } from "@/shared/ui/ClientOnly";
import { NotFound } from "@/shared/ui/NotFound";

export default function NotFoundPage() {
  return (
    <ClientOnly>
      <NotFound />
    </ClientOnly>
  );
}
