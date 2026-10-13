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
  /** Date of the next session in the showtimes API, "YYYY-MM-DD". */
  firstShowtime?: string;
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

export type MovieStatus = 'now' | 'presale' | 'soon';

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
