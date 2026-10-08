/** Item of every Grozze API list. Save `id`; `nome` is the display text. */
export interface GrozzeItem {
  id: number;
  nome: string;
}

export interface GrozzeLanguage extends GrozzeItem {
  /** "LEG", "DUB", "NAC". */
  codigo: string;
}

/** Body of every Grozze API error response. */
export interface GrozzeErrorBody {
  status: number;
  message: string;
  /** Validation errors (422) by field: `{ email: ['Informe um e-mail válido.'] }`. */
  details?: Record<string, string[] | undefined>;
}

export type GrozzeRole = 'user' | 'admin';

/** Catalog ids saved by the user, most recent first. */
export interface GrozzeFavorites {
  movies: string[];
  cinemas: string[];
}

export type GrozzeFavoriteKind = 'movie' | 'cinema';

/** Logged-in user as returned by `/auth/*` and `/me`. */
export interface GrozzeUser {
  id: string;
  name: string;
  email: string;
  role: GrozzeRole;
  avatar: GrozzeItem | null;
  /** `null` = no preference ("Todos"). */
  language: GrozzeLanguage | null;
  experience: GrozzeItem | null;
  genres: GrozzeItem[];
  receiveNews: boolean;
  favorites: GrozzeFavorites;
  createdAt: string;
}

/** Login, sign-up and refresh. The refresh token travels in an httpOnly cookie. */
export interface GrozzeAuthResponse {
  accessToken: string;
  /** Seconds until `accessToken` expires. */
  expiresIn: number;
  user: GrozzeUser;
}

/** One logged-in device. */
export interface GrozzeSession {
  id: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastUsedAt: string;
  /** The session making the request. */
  current: boolean;
}

export interface GrozzeSignupRequest {
  name: string;
  email: string;
  password: string;
  genreIds: number[];
  receiveNews: boolean;
}

/** Missing fields don't change; `null` clears the choice. */
export interface GrozzeUpdateMeRequest {
  name?: string;
  avatarId?: number | null;
  languageId?: number | null;
  experienceId?: number | null;
  genreIds?: number[];
  receiveNews?: boolean;
}

/** One page of a paginated list (`/news`, `/admin/users`...). */
export interface GrozzePaginated<T> {
  items: T[];
  /** Total across every page. */
  total: number;
  page: number;
  pageSize: number;
}

export type GrozzeNewsStatus = 'draft' | 'published';

/** News article in a list (without the full text). */
export interface GrozzeNewsSummary {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  status: GrozzeNewsStatus;
  /** `null` while a draft; a future date means scheduled. */
  publishedAt: string | null;
  author: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

/** Full news article. */
export interface GrozzeNews extends GrozzeNewsSummary {
  /** Plain text or Markdown — never render as raw HTML. */
  content: string;
  /** Catalog ids of related movies, in the admin's order. */
  relatedMovies: string[];
}

/** Create/update a news article. Missing fields on update keep their value. */
export interface GrozzeNewsInput {
  title?: string;
  slug?: string;
  summary?: string | null;
  content?: string;
  coverImageUrl?: string | null;
  movieIds?: string[];
  status?: GrozzeNewsStatus;
  /** ISO date; future = scheduled. */
  publishedAt?: string | null;
}

/** A user in the admin list. */
export interface GrozzeAdminUser {
  id: string;
  name: string;
  email: string;
  role: GrozzeRole;
  receiveNews: boolean;
  createdAt: string;
}

/** A user's full profile for the admin, with how many devices are connected. */
export interface GrozzeAdminUserDetail extends GrozzeUser {
  activeSessions: number;
}
