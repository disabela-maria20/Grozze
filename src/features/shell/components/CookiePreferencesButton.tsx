'use client';

import { useAppStore } from '@/shared/store/useAppStore';
import { Button } from '@/shared/ui/Button';

export function CookiePreferencesButton() {
  const openDialog = useAppStore((s) => s.openDialog);
  return (
    <Button onClick={() => openDialog('consent')}>
      Preferências de cookies
    </Button>
  );
}
