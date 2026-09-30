'use client';

import { request, type MovieOverrideInput } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';

export function usePublishOverrideMutation() {
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: MovieOverrideInput }) =>
      request(() => useAppStore.getState().publishOverride(id, values)),
  });
}
