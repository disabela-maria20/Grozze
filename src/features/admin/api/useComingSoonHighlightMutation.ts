'use client';

import {
  comingSoonHighlightQueryKey,
  grozzeComingSoonHighlight,
} from '@/entities/banner';
import { useAppStore } from '@/shared/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useComingSoonHighlightMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (movieId: string | null) =>
      grozzeComingSoonHighlight.replace(movieId),
    onSuccess: (highlight) => {
      queryClient.setQueryData(comingSoonHighlightQueryKey, highlight);
      useAppStore.getState().toast('Banner do Em breve salvo.');
    },
  });
}
