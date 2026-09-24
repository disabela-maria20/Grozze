import metaJson from "@/data/meta.json";
import moviesJson from "@/data/movies.json";
import cinemasJson from "@/data/cinemas.json";
import showtimesJson from "@/data/showtimes.json";
import distributorsJson from "@/data/distributors.json";
import newsJson from "@/data/news.json";
import type {
  Cinema,
  ContentState,
  Distributor,
  Meta,
  Movie,
  MovieOverride,
  MovieStatus,
  NewsItem,
  Showtime,
} from "./types";

export const META = metaJson as Meta;
export const DISTRIBUTORS = distributorsJson as Distributor[];
export const NEWS = newsJson as NewsItem[];

const baseMovies = new Map<string, Movie>(
  (moviesJson as Movie[]).map((m) => [String(m.id), Object.freeze({ ...m })]),
);
const baseCinemas = new Map<string, Cinema>(
  (cinemasJson as Cinema[]).map((c) => [String(c.id), Object.freeze({ ...c })]),
);
export const SESSIONS: Showtime[] = (showtimesJson as Showtime[]).map((s) =>
  Object.freeze({
    ...s,
    id: String(s.id),
    movie: String(s.movie),
    theater: String(s.theater),
  }),
);
export const sessionIndex = new Map(SESSIONS.map((s) => [s.id, s]));

export const normalize = (v: unknown): string =>
  String(v ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function safeImage(value: unknown): string {
  const s = String(value || "").trim();
  if (/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(s)) return s;
  try {
    const u = new URL(s);
    return u.protocol === "https:" ? u.href : "";
  } catch {
    return "";
  }
}

export function validDate(v: unknown): boolean {
  return (
    typeof v === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    !Number.isNaN(new Date(v + "T12:00:00").getTime())
  );
}

export function videoId(v: unknown): string {
  const value = String(v || "").trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  try {
    const u = new URL(value);
    if (/(^|\.)youtube\.com$/.test(u.hostname)) {
      const id = u.searchParams.get("v") || u.pathname.split("/").pop() || "";
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";
    }
    if (u.hostname === "youtu.be") return videoId(u.pathname.slice(1));
  } catch {
    /* not a URL */
  }
  return "";
}

const OVERRIDE_STRING_FIELDS: (keyof MovieOverride)[] = [
  "t",
  "syn",
  "director",
  "genre",
  "dur",
  "rating",
  "releaseDate",
  "poster",
  "backdrop",
  "trailer",
  "trailerTitle",
];

/** Merges CMS overrides onto the base SEED movie, mirroring the original `movie()` resolver. */
export function movie(id: string, overrides?: ContentState | null): Movie | null {
  const b = baseMovies.get(String(id));
  if (!b) return null;
  const o = overrides?.movies?.[String(id)] || {};
  const m: Movie = { ...b };
  for (const k of OVERRIDE_STRING_FIELDS) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) (m as any)[k] = v.trim();
  }
  if (Array.isArray(o.cast) && o.cast.length) m.cast = o.cast.slice(0, 4);
  m.poster = safeImage(m.poster);
  m.backdrop = safeImage(m.backdrop) || m.poster;
  m.trailer = videoId(m.trailer);
  return m;
}

export function allMovies(overrides?: ContentState | null): Movie[] {
  return [...baseMovies.keys()].map((id) => movie(id, overrides)!).filter(Boolean);
}

export function baseMovie(id: string): Movie | null {
  return baseMovies.get(String(id)) || null;
}

export const allBaseMovieIds = () => [...baseMovies.keys()];

export function cinema(id: string | undefined | null): Cinema | null {
  if (!id) return null;
  return baseCinemas.get(String(id)) || null;
}

export const allCinemas = () => [...baseCinemas.values()];

export function status(m: Movie | null | undefined): MovieStatus {
  if (!m) return "soon";
  if (m.presale && SESSIONS.some((s) => s.movie === m.id)) return "presale";
  if (validDate(m.releaseDate) && m.releaseDate > META.referenceDate) {
    return hasSessions(m.id) ? "presale" : "soon";
  }
  return "now";
}

export const statusLabel = (m: Movie | null | undefined): string =>
  ({ now: "Em cartaz", presale: "Pré-venda", soon: "Em breve" })[status(m)];

export const hasSessions = (id: string): boolean => SESSIONS.some((s) => s.movie === String(id));

export function movieList(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides).filter((m) => hasSessions(m.id));
}

export function soonMovies(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides).filter((m) => status(m) === "soon" && !hasSessions(m.id));
}

export function preMovies(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides).filter((m) => status(m) === "presale");
}

export function currentMovies(overrides?: ContentState | null): Movie[] {
  return allMovies(overrides)
    .filter((m) => status(m) === "now" && hasSessions(m.id))
    .sort((a, b) => (a.rank || 99) - (b.rank || 99));
}

export const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export function dateParts(d: string) {
  const dt = new Date(d + "T12:00:00");
  return {
    day: dt.getDate(),
    month: MONTH_NAMES[dt.getMonth()].slice(0, 3).toLowerCase(),
    weekday: WEEKDAYS[dt.getDay()],
  };
}

export function dateLabel(d: string | undefined, full = false): string {
  if (!validDate(d)) return "Data a confirmar";
  const p = dateParts(d!);
  return full
    ? `${p.day} de ${MONTH_NAMES[new Date(d + "T12:00:00").getMonth()].toLowerCase()} de ${d!.slice(0, 4)}`
    : `${p.day} ${p.month}`;
}

export function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

export interface SessionFilterState {
  date: string;
  tech: string;
  lang: string;
  cinema: string;
}

export function defaultFilmState(id: string): SessionFilterState {
  const dates = unique(SESSIONS.filter((s) => s.movie === id).map((s) => s.date)).sort();
  return { date: dates[0] || "", tech: "Todos", lang: "Todos", cinema: "Todos" };
}

export function movieDates(id: string): string[] {
  return unique(SESSIONS.filter((s) => s.movie === id).map((s) => s.date)).sort();
}

export function cinemaDates(id: string): string[] {
  return unique(SESSIONS.filter((s) => s.theater === id).map((s) => s.date)).sort();
}

export function filterRows(id: string, f: SessionFilterState, exclude = ""): Showtime[] {
  return SESSIONS.filter(
    (s) =>
      s.movie === id &&
      s.date === f.date &&
      (exclude === "tech" || f.tech === "Todos" || s.tech === f.tech) &&
      (exclude === "lang" || f.lang === "Todos" || s.lang === f.lang) &&
      (exclude === "cinema" || f.cinema === "Todos" || s.theater === f.cinema),
  );
}

export interface FilterOption {
  value: string;
  label: string;
  count: number;
  active: boolean;
  disabled: boolean;
}

export function filterGroupOptions(
  id: string,
  f: SessionFilterState,
  key: "tech" | "lang" | "cinema",
): FilterOption[] | null {
  const day = SESSIONS.filter((s) => s.movie === id && s.date === f.date);
  const field = key === "cinema" ? "theater" : key;
  const vals = unique(day.map((s) => (s as any)[field] as string));
  if (!vals.length) return null;
  const available = filterRows(id, f, key);
  return ["Todos", ...vals].map((v) => {
    const count = v === "Todos" ? available.length : available.filter((s) => (s as any)[field] === v).length;
    return {
      value: v,
      label: key === "cinema" && v !== "Todos" ? cinema(v)?.name || v : v,
      count,
      active: (f as any)[key] === v,
      disabled: count === 0,
    };
  });
}

export function groupedRooms(rows: Showtime[], preferences?: { language?: string; format?: string }): Showtime[][] {
  const map = new Map<string, Showtime[]>();
  for (const s of rows) {
    const key = [s.room, s.tech, s.lang].join("|");
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  const pref = preferences || {};
  const priority = (s: Showtime) =>
    (pref.language && pref.language !== "Todos" && s.lang === pref.language ? 2 : 0) +
    (pref.format && pref.format !== "Todos" && s.tech === pref.format ? 1 : 0);
  return [...map.values()]
    .sort(
      (a, b) =>
        priority(b[0]) - priority(a[0]) ||
        a[0].room.localeCompare(b[0].room, "pt-BR", { numeric: true }) ||
        a[0].lang.localeCompare(b[0].lang),
    )
    .map((r) => r.slice().sort((a, b) => a.time.localeCompare(b.time)));
}

export function distanceKm(c: Cinema, pos?: { lat: number; lng: number } | null): number | null {
  if (!pos) return null;
  const rad = (d: number) => (d * Math.PI) / 180;
  const a =
    Math.sin(rad(c.lat - pos.lat) / 2) ** 2 +
    Math.cos(rad(pos.lat)) * Math.cos(rad(c.lat)) * Math.sin(rad(c.lng - pos.lng) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function sortedCinemas(
  isCinemaSaved: (id: string) => boolean,
  coords?: { lat: number; lng: number } | null,
): Cinema[] {
  return allCinemas().sort(
    (a, b) =>
      Number(isCinemaSaved(b.id)) - Number(isCinemaSaved(a.id)) ||
      (distanceKm(a, coords) ?? 999) - (distanceKm(b, coords) ?? 999) ||
      a.name.localeCompare(b.name),
  );
}

export function movieHref(id: string, scope?: string | null): string {
  return scope ? `/distribuidora/${encodeURIComponent(scope)}/filme/${encodeURIComponent(id)}` : `/filme/${encodeURIComponent(id)}`;
}

export function newsHref(id: string, scope?: string | null): string {
  return scope ? `/distribuidora/${encodeURIComponent(scope)}/noticia/${encodeURIComponent(id)}` : `/noticia/${encodeURIComponent(id)}`;
}

export function relatedNews(m: Movie): NewsItem[] {
  return NEWS.filter((n) => n.dist === m.dist);
}

export function validateOverride(input: Record<string, unknown>): MovieOverride {
  const o: MovieOverride = {};
  for (const k of OVERRIDE_STRING_FIELDS) {
    const v = String((input as any)[k] ?? "").trim();
    if (!v) continue;
    if (v.length > 10000) throw new Error("Campo muito longo.");
    if ((k === "poster" || k === "backdrop") && !safeImage(v)) throw new Error("Use uma URL HTTPS válida para imagens.");
    if (k === "trailer" && !videoId(v)) throw new Error("Informe um ID ou link válido do YouTube.");
    if (k === "releaseDate" && !validDate(v)) throw new Error("Informe uma data de estreia válida.");
    (o as any)[k] = k === "trailer" ? videoId(v) : v;
  }
  const castInput = input.cast;
  const cast = Array.isArray(castInput) ? castInput : String(castInput || "").split(",");
  const names = cast
    .filter((x): x is string => typeof x === "string")
    .map((x) => x.trim())
    .filter(Boolean)
    .slice(0, 4);
  if (names.length) o.cast = names;
  return o;
}

export function ratingColor(r: string | undefined): { code: string; color: string } | null {
  const x = /livre|\bL\b/i.test(r || "") ? "L" : String(r || "").match(/\d+/)?.[0];
  if (!x) return null;
  const colors: Record<string, string> = {
    L: "#039749",
    "6": "#25a0aa",
    "10": "#057dbe",
    "12": "#efb600",
    "14": "#ea7921",
    "16": "#db2027",
    "18": "#191919",
  };
  return { code: x, color: colors[x] || "#526256" };
}
