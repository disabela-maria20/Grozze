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
