'use client';

import { grozzeNews } from '@/entities/news';
import { GROZZE_CONTENT_STALE_MS } from '@/shared/api';
import { useQuery } from '@tanstack/react-query';

/** One published article by slug. */
export function useNewsArticleQuery(slug: string) {
  return useQuery({
    queryKey: ['grozze', 'news', 'article', slug],
    staleTime: GROZZE_CONTENT_STALE_MS,
    queryFn: () => grozzeNews.getBySlug(slug),
    enabled: !!slug,
  });
}
