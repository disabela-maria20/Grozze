'use client';

import { request } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';

export function useRemoveOverrideMutation() {
  return useMutation({
    mutationFn: (id: string) =>
      request(() => useAppStore.getState().removeOverride(id)),
  });
}
