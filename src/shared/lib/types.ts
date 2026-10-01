export interface ImdbInfo {
  score?: string;
  votes?: string;
  url?: string;
}

export interface RawMovie {
  id: string;
  t: string;
  /** Legacy snapshot field; use `status(m)` instead. */
  status?: string;
  genre: string;
  dur: string;
  rating?: string;
  syn: string;
  cast?: string[];
  director?: string;
  distLabel: string;
  dist: string;
  release: string;
  rank?: number;
  colors?: string[];
  tag?: string;
  spSessions?: number;
  releaseDate: string;
  source?: string;
  sourceAsOf?: string;
  poster?: string;
  backdrop?: string;
  trailer?: string;
  imdb?: ImdbInfo;
  presale?: boolean;
}

export type Movie = RawMovie;

export interface Cinema {
  id: string;
  name: string;
  network: string;
  address: string;
  neighborhood: string;
  city: string;
  uf: string;
  lat: number | null;
  lng: number | null;
  roomCount: number;
  phones: string[];
  siteUrl: string;
}

export interface Showtime {
  id: string;
  movie: string;
  theater: string;
  date: string;
  time: string;
  tech: string;
  lang: string;
  room: string;
  /** Sales channel label, derived from the purchase URL host. */
  seller: string;
  purchaseUrl: string;
}

export interface Distributor {
  slug: string;
  name: string;
  formal: string;
  status: string;
  public: boolean;
  site: string;
  desc: string;
  featured?: string;
}

export interface NewsItem {
  id: string;
  k: string;
  t: string;
  d: string;
  p: string;
  dist: string;
  body: string;
  demo?: boolean;
  image?: string;
}

export type MovieStatus = 'now' | 'presale' | 'soon';

export interface Preferences {
  language: string;
  format: string;
  /** Optional: profiles saved before this field existed don't have it. */
  genres?: string[];
}

export interface Profile {
  name: string;
  email: string;
  savedMovies: string[];
  savedCinemas: string[];
  preferences: Preferences;
  avatar: 'initial' | 'star' | 'moon' | 'sun';
}

export interface MovieOverride {
  t?: string;
  syn?: string;
  director?: string;
  genre?: string;
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
  label: string;
  mode: 'manual' | 'geolocation';
  coords?: { lat: number; lng: number };
}
