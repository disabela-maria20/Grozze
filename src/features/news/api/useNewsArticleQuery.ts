'use client';

import { grozzeNews, GrozzeApiError } from '@/shared/api';
import { useQuery } from '@tanstack/react-query';

/** A missing article (404) stays missing; don't retry. */
const isNotFound = (err: unknown) =>
  err instanceof GrozzeApiError && err.status === 404;

/** One published article by slug. */
export function useNewsArticleQuery(slug: string) {
  return useQuery({
    queryKey: ['grozze', 'news', 'article', slug],
    queryFn: () => grozzeNews.getBySlug(slug),
    enabled: !!slug,
    retry: (count, err) => !isNotFound(err) && count < 1,
  });
}
