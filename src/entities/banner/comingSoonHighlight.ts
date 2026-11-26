import { authorized, grozzeGet } from '@/shared/api';

/** Movie featured on the coming-soon page. `null` = the next release. */
export interface ComingSoonHighlight {
  movieId: string | null;
}

/**
 * The coming-soon page's featured movie. Reading is public; saving needs an
 * admin login. No "banner" in the path: ad blockers drop those requests.
 */
export const grozzeComingSoonHighlight = {
  /** `GET /api/coming-soon-highlight` */
  get: () => grozzeGet<ComingSoonHighlight>('/coming-soon-highlight'),

  /** `PUT /api/admin/coming-soon-highlight` — `null` = back to the default. */
  replace: (movieId: string | null) =>
    authorized<ComingSoonHighlight>('/admin/coming-soon-highlight', {
      method: 'PUT',
      body: { movieId },
    }),
};

export const comingSoonHighlightQueryKey = [
  'grozze',
  'coming-soon-highlight',
] as const;
