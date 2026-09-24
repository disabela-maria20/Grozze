"use client";

import { useAppStore } from "@/shared/store/store";
import { Button } from "@/shared/ui/ui";

export function CookiePreferencesButton() {
  const openDialog = useAppStore((s) => s.openDialog);
  return <Button onClick={() => openDialog("consent")}>Preferências de cookies</Button>;
}
