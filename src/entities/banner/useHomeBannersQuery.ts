'use client';

import { useQuery } from '@tanstack/react-query';
import { GROZZE_CONTENT_STALE_MS } from '@/shared/api';
import { grozzeHomeBanners, homeBannersQueryKey } from './api';

/** Movie ids the admin picked for the home carousel. */
export function useHomeBannersQuery() {
  return useQuery({
    queryKey: homeBannersQueryKey,
    queryFn: grozzeHomeBanners.get,
    staleTime: GROZZE_CONTENT_STALE_MS,
  });
}
