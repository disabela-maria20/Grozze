'use client';

import { useAppStore } from '@/shared/store';
import { Button, Icon } from '@/shared/ui';

/** Shown instead of location-based lists while the user has no city. */
export function ChooseLocation({ children }: { children: string }) {
  const openDialog = useAppStore((s) => s.openDialog);
  return (
    <div className="border border-lime/20 rounded-app p-6 bg-lime-soft">
      <p className="text-lg m-0 mb-4">{children}</p>
      <Button primary onClick={() => openDialog('location')}>
        <Icon name="pin" className="w-[18px] h-[18px]" />
        Escolher cidade
      </Button>
    </div>
  );
}
