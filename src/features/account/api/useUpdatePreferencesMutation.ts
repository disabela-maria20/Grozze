'use client';

import {
  ensureGrozzeList,
  grozzeAuth,
  optionId,
  optionIds,
  type Preferences,
} from '@/shared/api';
import { useAppStore } from '@/shared/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/** Preferences are picked by name in the form and saved by id in the API. */
export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (prefs: Preferences) => {
      const [languages, experiences, genres] = await Promise.all([
        ensureGrozzeList(queryClient, 'languages'),
        ensureGrozzeList(queryClient, 'experiences'),
        ensureGrozzeList(queryClient, 'movieGenres'),
      ]);
      return grozzeAuth.updateMe({
        languageId: optionId(languages, prefs.language),
        experienceId: optionId(experiences, prefs.format),
        genreIds: optionIds(genres, prefs.genres ?? []),
      });
    },
    onSuccess: (user) => {
      const store = useAppStore.getState();
      store.setAccount(user);
      store.toast('Preferências salvas.');
    },
  });
}
