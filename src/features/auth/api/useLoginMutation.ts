'use client';

import { request } from '@/shared/api/request';
import { useAppStore } from '@/shared/store/useAppStore';
import { useMutation } from '@tanstack/react-query';
import { type LoginInput } from './LoginInput';

export function useLoginMutation() {
  return useMutation({
    // `password` is part of the API contract but never stored locally;
    // it will be sent to the backend once authentication exists.
    mutationFn: ({
      name = '',
      email,
      signup,
      marketingConsent,
      favoriteGenres,
    }: LoginInput) =>
      request(() => {
        const result = useAppStore
          .getState()
          .completeLogin(name, email, signup, marketingConsent, favoriteGenres);
        if (!result.ok) throw new Error('Informe um e-mail válido.');
        return result;
      }),
  });
}
