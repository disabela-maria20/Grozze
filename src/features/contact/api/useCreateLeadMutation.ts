'use client';

import { request, type CreateLeadRequest } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';

export function useCreateLeadMutation() {
  return useMutation({
    mutationFn: (input: CreateLeadRequest) =>
      request(() => useAppStore.getState().captureLead(input)),
  });
}
