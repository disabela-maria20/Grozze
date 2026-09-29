'use client';

import { request } from '@/shared/api/request';
import { useAppStore } from '@/shared/store/useAppStore';
import { useMutation } from '@tanstack/react-query';
import { type LoginInput } from './LoginInput';

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ name = '', email, signup, marketingConsent }: LoginInput) =>
      request(() => {
        const result = useAppStore
          .getState()
          .completeLogin(name, email, signup, marketingConsent);
        if (!result.ok) throw new Error('Informe um e-mail válido.');
        return result;
      }),
  });
}
