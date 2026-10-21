'use client';

import { grozzeMovieOverrides } from '@/entities/movie';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';
import { useContentChange, withOverride } from './useContentChange';

/** Back to the source data (the API also deletes the movie's S3 images). */
export function useRemoveOverrideMutation() {
  const applyChange = useContentChange();
  return useMutation({
    mutationFn: async (id: string) => {
      await grozzeMovieOverrides.remove(id);
      return id;
    },
    onSuccess: (id) => {
      const { content, toast } = useAppStore.getState();
      applyChange(withOverride(content, id, null), 'Override removido', id);
      toast('Dados de origem restaurados.');
    },
  });
}
