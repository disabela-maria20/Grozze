'use client';

import { ensureGrozzeList, grozzeAuth, optionIds } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  /** Genre names, as picked in the form. */
  favoriteGenres: string[];
  marketingConsent: boolean;
}

export function useSignupMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SignupInput) => {
      const genres = input.favoriteGenres.length
        ? await ensureGrozzeList(queryClient, 'movieGenres')
        : [];
      return grozzeAuth.signup({
        name: input.name,
        email: input.email,
        password: input.password,
        genreIds: optionIds(genres, input.favoriteGenres),
        receiveNews: input.marketingConsent,
      });
    },
    onSuccess: (user, { marketingConsent }) =>
      useAppStore
        .getState()
        .completeLogin(user, { signup: true, marketingConsent }),
  });
}
