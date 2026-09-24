import { useAppStore } from "./store";
import { scopeFromPath, usePathname } from "./useRoute";

/** Mirrors the original `accountAction()`: gated by login, aware of distributor-hub scope. */
export function useAccountAction() {
  const logged = useAppStore((s) => s.logged());
  const scope = scopeFromPath(usePathname());
  const openDialog = useAppStore((s) => s.openDialog);

  return () => {
    if (!logged) {
      openDialog("auth", { signup: false });
      return;
    }
    if (scope) {
      openDialog("account-hub", { scope });
      return;
    }
    if (typeof window !== "undefined") window.location.href = "/minha-grozze";
  };
}
