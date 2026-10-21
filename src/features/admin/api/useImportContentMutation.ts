'use client';

import { grozzeMovieOverrides } from '@/entities/movie';
import { useAppStore } from '@/shared/store';
import { useMutation } from '@tanstack/react-query';
import { parseContent } from '../lib';
import { useContentChange } from './useContentChange';

const MAX_IMPORT_BYTES = 2_000_000;

/** Replaces every override in the API with the ones of an exported file. */
export function useImportContentMutation() {
  const applyChange = useContentChange();
  return useMutation({
    mutationFn: async (file: File) => {
      if (file.size > MAX_IMPORT_BYTES)
        throw new Error('Arquivo muito grande.');
      const content = parseContent(JSON.parse(await file.text()));
      return grozzeMovieOverrides.replaceAll(content);
    },
    onSuccess: (content) => {
      applyChange(
        content,
        'Overrides importados',
        '-',
        Object.keys(content.movies)
      );
      useAppStore.getState().toast('Overrides importados.');
    },
  });
}
