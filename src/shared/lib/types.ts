export interface Preferences {
  language: string;
  format: string;
  /** Optional: profiles saved before this field existed don't have it. */
  genres?: string[];
}

export interface Profile {
  name: string;
  email: string;
  /** From the Grozze API; profiles saved before login existed don't have it. */
  role?: 'user' | 'admin';
  savedMovies: string[];
  savedCinemas: string[];
  preferences: Preferences;
  avatar: 'initial' | 'star' | 'moon' | 'sun';
}

/** CMS edits of a movie; same field names as `Movie`. */
export interface MovieOverride {
  /** Title. */
  t?: string;
  /** Synopsis. */
  syn?: string;
  director?: string;
  genre?: string;
  /** Duration label. */
  dur?: string;
  rating?: string;
  releaseDate?: string;
  poster?: string;
  backdrop?: string;
  trailer?: string;
  trailerTitle?: string;
  cast?: string[];
}

export interface ContentState {
  schemaVersion: 1;
  movies: Record<string, MovieOverride>;
}

export interface AuditEntry {
  date: string;
  action: string;
  id: string;
  fields: string[];
  actor: string;
}

export interface Lead {
  id: string;
  /** Dedup key: lowercased e-mail + "|" + source. */
  key: string;
  name: string;
  email: string;
  source: string;
  message: string;
  marketingConsent: boolean;
  consentVersion: number;
  scope: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentState {
  version: 1;
  essential: boolean;
  preferences: boolean;
  date: string;
}

export interface LocationState {
  /** Shown to the user: the city name. */
  label: string;
  mode: 'manual' | 'geolocation';
  /** Cinemas are matched by city + state (see `inLocation`). */
  city?: string;
  /** State abbreviation ("SP"), as the catalog stores it. Never shown. */
  uf?: string;
  coords?: { lat: number; lng: number };
}
