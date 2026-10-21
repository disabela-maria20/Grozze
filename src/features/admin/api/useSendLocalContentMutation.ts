'use client';

import { grozzeMovieOverrides } from '@/entities/movie';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';
import { useContentChange } from './useContentChange';

/**
 * Sends the overrides this browser kept before they lived in the API. They
 * are merged over the API's (the browser's version wins for the same movie).
 */
export function useSendLocalContentMutation() {
  const applyChange = useContentChange();
  return useMutation({
    mutationFn: () => {
      const { content, localContent } = useAppStore.getState();
      return grozzeMovieOverrides.replaceAll({
        schemaVersion: 1,
        movies: { ...content.movies, ...localContent?.movies },
      });
    },
    onSuccess: (content) => {
      const store = useAppStore.getState();
      const sent = Object.keys(store.localContent?.movies ?? {});
      applyChange(content, 'Overrides do navegador enviados', '-', sent);
      store.clearLocalContent();
      store.toast('Overrides deste navegador enviados ao servidor.');
    },
  });
}
