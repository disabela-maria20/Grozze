export interface ImdbInfo {
  score?: string;
  votes?: string;
  url?: string;
}

export interface RawMovie {
  id: string;
  /** Title. */
  t: string;
  /** Legacy snapshot field; use `status(m)` instead. */
  status?: string;
  genre: string;
  /** Duration label ("1h39", "45 min"). */
  dur: string;
  /** Age rating ("Livre", "16"). */
  rating?: string;
  /** Synopsis. */
  syn: string;
  cast?: string[];
  director?: string;
  /** Distributor name as shown to users. */
  distLabel: string;
  /** Distributor slug (see `distributorSlug`). */
  dist: string;
  /** Release date label ("8 set"). */
  release: string;
  rank?: number;
  colors?: string[];
  tag?: string;
  spSessions?: number;
  /** Release date, "YYYY-MM-DD". */
  releaseDate: string;
  source?: string;
  sourceAsOf?: string;
  poster?: string;
  backdrop?: string;
  /** YouTube video id. */
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
  /** Movie id. */
  movie: string;
  /** Cinema id. */
  theater: string;
  date: string;
  time: string;
  /** Projection format ("IMAX 2D", "3D", "Tradicional"). */
  tech: string;
  /** Audio language ("Dublado", "Legendado"...). */
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
  /** Kicker: category label ("Estreias"). */
  k: string;
  /** Title. */
  t: string;
  /** Display date ("8 set 2026"). */
  d: string;
  /** Summary paragraph. */
  p: string;
  /** Distributor slug; empty for general news. */
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
  label: string;
  mode: 'manual' | 'geolocation';
  coords?: { lat: number; lng: number };
}
