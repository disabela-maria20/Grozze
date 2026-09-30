'use client';

import { request } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';

export function useUpdateProfileNameMutation() {
  return useMutation({
    mutationFn: (name: string) =>
      request(() => useAppStore.getState().updateProfileName(name)),
  });
}
