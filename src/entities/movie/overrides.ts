import { authorized, grozzeGet } from '@/shared/api';
import type { ContentState, MovieOverride } from '@/shared/lib/types';

/** `GET /api/movie-overrides` */
interface MovieOverridesResponse {
  movies: Record<string, MovieOverride>;
}

const toContent = ({ movies }: MovieOverridesResponse): ContentState => ({
  schemaVersion: 1,
  movies,
});

export const movieOverridesQueryKey = ['grozze', 'movie-overrides'] as const;

/**
 * CMS edits of catalog movies, kept by the Grozze API. Reading is public
 * (the site applies them everywhere); saving needs an admin login. Images
 * picked in the editor travel as files: the API stores them in S3.
 */
export const grozzeMovieOverrides = {
  list: async () =>
    toContent(await grozzeGet<MovieOverridesResponse>('/movie-overrides')),

  /**
   * `PUT /api/admin/movie-overrides/:id` (multipart): replaces the movie's
   * edit. `override: null` means it's back to the source data.
   */
  save: (movieId: string, form: FormData) =>
    authorized<{ movieId: string; override: MovieOverride | null }>(
      `/admin/movie-overrides/${encodeURIComponent(movieId)}`,
      { method: 'PUT', body: form }
    ),

  remove: (movieId: string) =>
    authorized<null>(`/admin/movie-overrides/${encodeURIComponent(movieId)}`, {
      method: 'DELETE',
    }),

  /** `PUT /api/admin/movie-overrides`: replaces every edit (file import). */
  replaceAll: async (content: ContentState) =>
    toContent(
      await authorized<MovieOverridesResponse>('/admin/movie-overrides', {
        method: 'PUT',
        body: content,
      })
    ),
};
