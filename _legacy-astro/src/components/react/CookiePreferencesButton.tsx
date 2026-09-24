import { useAppStore } from "../../lib/store";
import { Button } from "./ui";

export function CookiePreferencesButton() {
  const openDialog = useAppStore((s) => s.openDialog);
  return <Button onClick={() => openDialog("consent")}>Preferências de cookies</Button>;
}
