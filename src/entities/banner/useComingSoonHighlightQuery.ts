'use client';

import { useQuery } from '@tanstack/react-query';
import { GROZZE_CONTENT_STALE_MS } from '@/shared/api';
import {
  comingSoonHighlightQueryKey,
  grozzeComingSoonHighlight,
} from './comingSoonHighlight';

/** Movie the admin picked for the coming-soon page's banner. */
export function useComingSoonHighlightQuery() {
  return useQuery({
    queryKey: comingSoonHighlightQueryKey,
    queryFn: grozzeComingSoonHighlight.get,
    staleTime: GROZZE_CONTENT_STALE_MS,
  });
}
