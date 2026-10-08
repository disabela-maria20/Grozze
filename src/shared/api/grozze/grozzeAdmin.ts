import { authorized } from './grozzeAuth';
import type {
  GrozzeAdminUser,
  GrozzeAdminUserDetail,
  GrozzeItem,
  GrozzeLanguage,
  GrozzePaginated,
  GrozzeRole,
} from './grozzeTypes';

/** Option lists the admin manages. The path matches `/api/admin/<lookup>`. */
export type GrozzeLookup =
  'avatars' | 'languages' | 'experiences' | 'movie-genres';

/** Body for avatars, experiences and genres (languages add `codigo`). */
export interface GrozzeLookupInput {
  nome?: string;
  codigo?: string;
}

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}

export interface AdminUsersListParams {
  page?: number;
  pageSize?: number;
  role?: GrozzeRole;
  search?: string;
}

/** Admin-only operations: option lists and user management. */
export const grozzeAdmin = {
  // Option lists (reading uses the public lists: grozzeApi.*)
  createLookup: (lookup: GrozzeLookup, body: GrozzeLookupInput) =>
    authorized<GrozzeItem | GrozzeLanguage>(`/admin/${lookup}`, {
      method: 'POST',
      body,
    }),

  updateLookup: (lookup: GrozzeLookup, id: number, body: GrozzeLookupInput) =>
    authorized<GrozzeItem | GrozzeLanguage>(`/admin/${lookup}/${id}`, {
      method: 'PATCH',
      body,
    }),

  deleteLookup: (lookup: GrozzeLookup, id: number) =>
    authorized<null>(`/admin/${lookup}/${id}`, { method: 'DELETE' }),

  // Users
  users: (params: AdminUsersListParams = {}) =>
    authorized<GrozzePaginated<GrozzeAdminUser>>(
      `/admin/users${query({ ...params })}`
    ),

  user: (id: string) =>
    authorized<GrozzeAdminUserDetail>(`/admin/users/${encodeURIComponent(id)}`),

  setUserRole: (id: string, role: GrozzeRole) =>
    authorized<GrozzeAdminUserDetail>(
      `/admin/users/${encodeURIComponent(id)}/role`,
      { method: 'PATCH', body: { role } }
    ),

  revokeUserSessions: (id: string) =>
    authorized<null>(`/admin/users/${encodeURIComponent(id)}/sessions`, {
      method: 'DELETE',
    }),

  deleteUser: (id: string) =>
    authorized<null>(`/admin/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),
};
