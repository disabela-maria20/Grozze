'use client';

import { request } from '@/shared/api/request';
import type { CreateLeadRequest } from '@/shared/api/types';
import { useAppStore } from '@/shared/store/useAppStore';
import { useMutation } from '@tanstack/react-query';

export function useCreateLeadMutation() {
  return useMutation({
    mutationFn: (input: CreateLeadRequest) =>
      request(() => useAppStore.getState().captureLead(input)),
  });
}
