'use client';

import { useQuery, type QueryClient } from '@tanstack/react-query';
import {
  GROZZE_API_KEY,
  GROZZE_CACHE_SECONDS,
  GrozzeApiError,
  grozzeApi,
} from './grozze';

type GrozzeList = keyof typeof grozzeApi;
type GrozzeListData<K extends GrozzeList> = Awaited<
  ReturnType<(typeof grozzeApi)[K]>
>;

/** Missing key (401) or wrong URL (404) won't fix themselves on retry. */
const PERMANENT_ERRORS = [401, 404];

const listQueryOptions = <K extends GrozzeList>(list: K) => ({
  queryKey: ['grozze', list],
  queryFn: grozzeApi[list] as () => Promise<GrozzeListData<K>>,
  staleTime: GROZZE_CACHE_SECONDS * 1000,
  gcTime: GROZZE_CACHE_SECONDS * 1000,
  retry: (failureCount: number, err: unknown) =>
    !(err instanceof GrozzeApiError && PERMANENT_ERRORS.includes(err.status)) &&
    failureCount < 1,
});

/**
 * One Grozze API list, fetched once and reused for 24 hours. Disabled while
 * no API key is configured, so callers fall back to their local list when
 * `data` is undefined (not configured, loading or failed).
 */
export function useGrozzeListQuery<K extends GrozzeList>(list: K) {
  return useQuery({ ...listQueryOptions(list), enabled: !!GROZZE_API_KEY });
}

/** The same list for code outside render (mutations): cached or fetched now. */
export function ensureGrozzeList<K extends GrozzeList>(
  queryClient: QueryClient,
  list: K
): Promise<GrozzeListData<K>> {
  return queryClient.ensureQueryData(listQueryOptions(list));
}
