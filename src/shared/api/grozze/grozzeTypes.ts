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
