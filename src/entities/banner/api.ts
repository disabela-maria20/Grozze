import { authorized, grozzeGet } from '@/shared/api';
import type { HomeBanners } from './types';

/** Slides the home carousel accepts (the API rejects more). */
export const MAX_HOME_BANNERS = 10;

/**
 * The home carousel. Reading is public; saving needs an admin login. The
 * paths avoid the word "banner": ad blockers drop requests whose URL has it.
 */
export const grozzeHomeBanners = {
  /** `GET /api/home-carousel` */
  get: () => grozzeGet<HomeBanners>('/home-carousel'),

  /** `PUT /api/admin/home-carousel` — replaces the whole list. `[]` = default. */
  replace: (movieIds: string[]) =>
    authorized<HomeBanners>('/admin/home-carousel', {
      method: 'PUT',
      body: { movieIds },
    }),
};

export const homeBannersQueryKey = ['grozze', 'home-banners'] as const;
