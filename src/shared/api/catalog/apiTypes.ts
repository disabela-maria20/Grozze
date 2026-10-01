/**
 * Raw payloads of the catalog API (see `endpoints-catalogo.txt`).
 * Mapped to the app's `Movie`, `Cinema` and `Showtime` by `toMovie`,
 * `toCinema` and `toShowtimes`.
 */

export interface ApiMovieAsset {
  id: number;
  movie_id: number;
  /** "cartaz" = poster, "capa" = banner, "trailer" = YouTube embed URL. */
  type: string;
  image: string | null;
  url: string | null;
}

export interface ApiMovie {
  id: number;
  title: string;
  original_title: string | null;
  synopsis: string | null;
  director: string | null;
  /** Names separated by line breaks or commas. */
  cast: string | null;
  genres: string | null;
  /** Minutes, as a string. */
  duration: string | null;
  age_rating: string | null;
  country_origin: string | null;
  distributor: string | null;
  /** "YYYY-MM-DD HH:mm:ss" */
  release_date: string | null;
  pre_release_date: string | null;
  /** Only in `GET /api/movies`. */
  first_showtime_date?: string | null;
  assets: ApiMovieAsset[];
  /** Image file name, relative to `CATALOG_IMAGE_URL`. */
  poster: string | null;
  trailer: string | null;
}

export interface ApiCinema {
  id: number;
  name: string;
  alias: string | null;
  slug: string | null;
  network: string | null;
  city: string | null;
  state: string | null;
  uf?: string | null;
  /** Showtimes responses use `state_code` instead of `uf`. */
  state_code?: string | null;
  country?: string | null;
  address: string | null;
  address_complement?: string | null;
  number: string | null;
  neighborhood: string | null;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  total_rooms?: number | null;
  site_url?: string | null;
  images?: { url: string; type: string }[];
  properties?: Record<string, unknown>;
  telephones?: string[];
  delivery_type?: string[];
  status?: string;
}

export interface ApiShowtimeRoom {
  id: number;
  name: string;
  /** "Dubbed", "Subtitled"... */
  language: string | null;
  /** "2D", "3D"... */
  format: string | null;
  imax: boolean;
  times: { time: string; purchase_url: string | null }[];
}

export interface ApiShowtimeCinema extends ApiCinema {
  rooms: ApiShowtimeRoom[];
}

export interface ApiShowtimeDay {
  date: string;
  cinemas: ApiShowtimeCinema[];
}

export interface ApiMoviesResponse {
  movies: ApiMovie[];
}

export interface ApiCinemasResponse {
  cinemas: ApiCinema[];
}

export interface ApiCinemaResponse {
  cinema: ApiCinema;
}

export interface ApiShowtimesResponse {
  movie: ApiMovie;
  showtimes: ApiShowtimeDay[];
}
