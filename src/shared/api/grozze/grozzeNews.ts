import { authorized } from './grozzeAuth';
import { grozzeGet } from './grozzeGet';
import type {
  GrozzeNews,
  GrozzeNewsInput,
  GrozzeNewsStatus,
  GrozzeNewsSummary,
  GrozzePaginated,
} from './grozzeTypes';

/** Drops empty params so `?page=1` stays clean. */
function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

export interface AdminNewsListParams {
  page?: number;
  pageSize?: number;
  status?: GrozzeNewsStatus;
  search?: string;
}

/**
 * The blog. Reading the published list and one article is public; everything
 * else needs an admin login (handled by `authorized`, which refreshes the
 * access token once on a 401).
 */
export const grozzeNews = {
  /** `GET /api/news` — published articles only, newest first. */
  list: (page = 1, pageSize = 12) =>
    grozzeGet<GrozzePaginated<GrozzeNewsSummary>>(
      `/news${query({ page, pageSize })}`
    ),

  /** `GET /api/news/:slug` — one published article with its text. */
  getBySlug: (slug: string) =>
    grozzeGet<GrozzeNews>(`/news/${encodeURIComponent(slug)}`),

  /** Admin: every article, including drafts and scheduled ones. */
  listAll: ({
    page = 1,
    pageSize = 20,
    status,
    search,
  }: AdminNewsListParams = {}) =>
    authorized<GrozzePaginated<GrozzeNewsSummary>>(
      `/admin/news${query({ page, pageSize, status, search })}`
    ),

  get: (id: string) =>
    authorized<GrozzeNews>(`/admin/news/${encodeURIComponent(id)}`),

  create: (body: GrozzeNewsInput) =>
    authorized<GrozzeNews>('/admin/news', { method: 'POST', body }),

  update: (id: string, body: GrozzeNewsInput) =>
    authorized<GrozzeNews>(`/admin/news/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body,
    }),

  remove: (id: string) =>
    authorized<null>(`/admin/news/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};
