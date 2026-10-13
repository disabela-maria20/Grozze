import { authorized, grozzeGet } from '@/shared/api';
import type { HomeBanners } from './types';

/** Slides the home carousel accepts (the API rejects more). */
export const MAX_HOME_BANNERS = 10;

/** The home carousel. Reading is public; saving needs an admin login. */
export const grozzeHomeBanners = {
  /** `GET /api/home-banners` */
  get: () => grozzeGet<HomeBanners>('/home-banners'),

  /** `PUT /api/admin/home-banners` — replaces the whole list. `[]` = default. */
  replace: (movieIds: string[]) =>
    authorized<HomeBanners>('/admin/home-banners', {
      method: 'PUT',
      body: { movieIds },
    }),
};

export const homeBannersQueryKey = ['grozze', 'home-banners'] as const;
