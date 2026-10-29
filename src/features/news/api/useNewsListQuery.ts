'use client';

import { grozzeNews } from '@/entities/news';
import { GROZZE_CONTENT_STALE_MS } from '@/shared/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

/** Published articles, newest first. One page at a time (keeps the old one while loading). */
export function useNewsListQuery(page = 1, pageSize = 12) {
  return useQuery({
    queryKey: ['grozze', 'news', 'list', page, pageSize],
    staleTime: GROZZE_CONTENT_STALE_MS,
    queryFn: () => grozzeNews.list(page, pageSize),
    placeholderData: keepPreviousData,
  });
}
