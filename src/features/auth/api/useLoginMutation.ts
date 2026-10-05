'use client';

import { grozzeAuth } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';

export interface LoginInput {
  email: string;
  password: string;
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: LoginInput) =>
      grozzeAuth.login(email, password),
    onSuccess: (user) => useAppStore.getState().completeLogin(user),
  });
}
