'use client';

import { grozzeNews, GrozzeApiError } from '@/shared/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

/** 404 won't fix itself on retry. */
const isPermanent = (err: unknown) =>
  err instanceof GrozzeApiError && err.status === 404;

/** Published articles, newest first. One page at a time (keeps the old one while loading). */
export function useNewsListQuery(page = 1, pageSize = 12) {
  return useQuery({
    queryKey: ['grozze', 'news', 'list', page, pageSize],
    queryFn: () => grozzeNews.list(page, pageSize),
    placeholderData: keepPreviousData,
    retry: (count, err) => !isPermanent(err) && count < 1,
  });
}
