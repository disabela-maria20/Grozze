'use client';

import { grozzeMovieOverrides } from '@/entities/movie';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';
import { useContentChange, withOverride } from './useContentChange';

/** Images picked as files; they replace the URL of the same field. */
export interface OverrideImages {
  poster?: File | null;
  backdrop?: File | null;
}

/**
 * Publishes a movie's edit to the API in one multipart request: the text
 * fields plus the image files, which the API stores in S3. Empty fields keep
 * the source data.
 */
export function usePublishOverrideMutation() {
  const applyChange = useContentChange();
  return useMutation({
    mutationFn: ({
      id,
      values,
      images,
    }: {
      id: string;
      values: Record<string, string>;
      images: OverrideImages;
    }) => {
      const form = new FormData();
      for (const [field, value] of Object.entries(values)) {
        form.append(field, value);
      }
      for (const [field, file] of Object.entries(images)) {
        if (file) form.append(field, file);
      }
      return grozzeMovieOverrides.save(id, form);
    },
    onSuccess: ({ movieId, override }) => {
      const { content, toast } = useAppStore.getState();
      applyChange(
        withOverride(content, movieId, override),
        override ? 'Override publicado' : 'Override removido',
        movieId,
        Object.keys(override ?? {})
      );
      toast(override ? 'Conteúdo publicado.' : 'Dados de origem restaurados.');
    },
  });
}
