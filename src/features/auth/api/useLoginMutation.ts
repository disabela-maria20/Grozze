'use client';

import { grozzeAuth, SENSITIVE_MUTATION } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';

export interface LoginInput {
  email: string;
  password: string;
}

export function useLoginMutation() {
  return useMutation({
    ...SENSITIVE_MUTATION,
    mutationFn: ({ email, password }: LoginInput) =>
      grozzeAuth.login(email, password),
    onSuccess: (user) => useAppStore.getState().completeLogin(user),
  });
}
