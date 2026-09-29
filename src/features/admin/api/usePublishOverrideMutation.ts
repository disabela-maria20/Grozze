'use client';

import { request } from '@/shared/api/request';
import type { MovieOverrideInput } from '@/shared/api/types';
import { useAppStore } from '@/shared/store/useAppStore';
import { useMutation } from '@tanstack/react-query';

export function usePublishOverrideMutation() {
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: MovieOverrideInput }) =>
      request(() => useAppStore.getState().publishOverride(id, values)),
  });
}
