'use client';

import { useQueryClient } from '@tanstack/react-query';
import { movieOverridesQueryKey } from '@/entities/movie';
import type { ContentState } from '@/shared/lib/types';
import { useAppStore } from '@/shared/store';

/**
 * After the API saved overrides: applies them to every screen right away,
 * keeps the query cache in sync and logs the change in the audit tab.
 */
export function useContentChange() {
  const queryClient = useQueryClient();
  return (
    content: ContentState,
    action: string,
    id: string,
    fields?: string[]
  ) => {
    queryClient.setQueryData(movieOverridesQueryKey, content);
    useAppStore.getState().recordContentChange(content, action, id, fields);
  };
}

/** `content` with the movie's override replaced (or removed, when null). */
export function withOverride(
  content: ContentState,
  id: string,
  override: ContentState['movies'][string] | null
): ContentState {
  const movies = { ...content.movies };
  if (override) movies[id] = override;
  else delete movies[id];
  return { schemaVersion: 1, movies };
}
