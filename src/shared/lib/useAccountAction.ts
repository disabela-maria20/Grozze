"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/shared/store/store";
import { scopeFromPath } from "./route";

/** Mirrors the original `accountAction()`: gated by login, aware of distributor-hub scope. */
export function useAccountAction() {
  const logged = useAppStore((s) => s.logged());
  const scope = scopeFromPath(usePathname());
  const openDialog = useAppStore((s) => s.openDialog);
  const router = useRouter();

  return () => {
    if (!logged) {
      openDialog("auth", { signup: false });
      return;
    }
    if (scope) {
      openDialog("account-hub", { scope });
      return;
    }
    router.push("/minha-grozze");
  };
}
