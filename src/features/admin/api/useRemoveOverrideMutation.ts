'use client';

import { request } from '@/shared/api/request';
import { useAppStore } from '@/shared/store/useAppStore';
import { useMutation } from '@tanstack/react-query';

export function useRemoveOverrideMutation() {
  return useMutation({
    mutationFn: (id: string) =>
      request(() => useAppStore.getState().removeOverride(id)),
  });
}
