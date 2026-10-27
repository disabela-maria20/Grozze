import { type Movie, allMovies, status } from '@/entities/movie';
import { addDays, nowInSaoPaulo, validDate } from '@/shared/lib/date';
import type { ContentState } from '@/shared/lib/types';

/**
 * "Ainda dá tempo": in theaters for 4 to 16 weeks (a typical run), so about to
 * leave. Older movies with sessions are special screenings, not leaving.
 */
const LAST_CHANCE_AFTER_DAYS = 28;
const LAST_CHANCE_UNTIL_DAYS = 112;
/** "O que vem aí" looks this far ahead. */
const COMING_SOON_WITHIN_DAYS = 90;

const LIMITS = {
  top10: 10,
  presale: 12,
  lastChance: 8,
  nearby: 12,
  comingSoon: 12,
  hero: 5,
};

/** Below this many movies a section looks broken, so it's hidden. */
const MIN_MOVIES = 4;
const TOP10_MIN_MOVIES = 5;

export interface HomeSections {
  /** "Nos cinemas · Perto de você" */
  nearby: Movie[];
  /** "Venda antecipada · Pré-venda" */
  presale: Movie[];
  /** "Na sua cidade · Top 10" */
  top10: Movie[];
  /** "Ainda dá tempo" */
  lastChance: Movie[];
  /** "Próximas estreias · O que vem aí" */
  comingSoon: Movie[];
  /** Carousel when the admin picked no banner */
  hero: Movie[];
}

/**
 * When the movie really premiered. For a movie back in theaters the catalog
 * moves `releaseDate` to its first session; the original date keeps a 2023
 * re-screening from counting as a new release.
 */
const premiere = (m: Movie) =>
  validDate(m.originalRelease) ? m.originalRelease! : m.releaseDate;

const newestFirst = (a: Movie, b: Movie) =>
  premiere(b).localeCompare(premiere(a));
const oldestFirst = (a: Movie, b: Movie) =>
  premiere(a).localeCompare(premiere(b));
/** Upcoming movies: the next to reach theaters first. */
const soonestFirst = (a: Movie, b: Movie) =>
  a.releaseDate.localeCompare(b.releaseDate);
/** Movies with a poster before the ones without (blank cards look broken). */
const posterFirst = (a: Movie, b: Movie) =>
  Number(!!b.poster) - Number(!!a.poster);

const atLeast = (list: Movie[], min: number) =>
  list.length >= min ? list : [];

/**
 * The home's movie sections. The catalog only says whether a movie has
 * sessions somewhere in Brazil (per-city counts would mean downloading every
 * movie's showtimes), so the rules use release dates:
 *
 * - Top 10: the newest releases in theaters (they get the most screens).
 * - Pré-venda: sessions on sale, release within the next 7 days.
 * - Ainda dá tempo: in theaters for 4 to 16 weeks, oldest first.
 * - Perto de você: the other movies in theaters, posters and newest first.
 * - O que vem aí: release after the pre-sale window, up to 90 days ahead.
 *
 * A movie appears in one section only (the order above decides).
 *
 * With `cityMovieIds` (the movies playing in the user's city), movies with
 * sessions only elsewhere are left out, and "Perto de você" takes whatever
 * is left even when it's a few, so a small city still shows all it has.
 * "O que vem aí" stays national: those movies have no sessions yet.
 */
export function homeSections(
  overrides?: ContentState | null,
  cityMovieIds?: Set<string> | null
): HomeSections {
  const today = nowInSaoPaulo().date;
  const movies = allMovies(overrides).filter(
    (m) => !cityMovieIds || status(m) === 'soon' || cityMovieIds.has(m.id)
  );
  const used = new Set<string>();
  const take = (list: Movie[], limit: number) => {
    const picked = list.filter((m) => !used.has(m.id)).slice(0, limit);
    for (const m of picked) used.add(m.id);
    return picked;
  };

  const inTheaters = movies.filter((m) => status(m) === 'now');

  const top10 = atLeast(
    take(
      inTheaters
        .filter((m) => validDate(m.releaseDate))
        .sort((a, b) => newestFirst(a, b) || posterFirst(a, b)),
      LIMITS.top10
    ),
    TOP10_MIN_MOVIES
  );

  const presale = atLeast(
    take(
      movies.filter((m) => status(m) === 'presale').sort(soonestFirst),
      LIMITS.presale
    ),
    MIN_MOVIES
  );

  const leavingBefore = addDays(today, -LAST_CHANCE_AFTER_DAYS);
  const leavingAfter = addDays(today, -LAST_CHANCE_UNTIL_DAYS);
  const lastChance = atLeast(
    take(
      inTheaters
        .filter(
          (m) =>
            validDate(m.releaseDate) &&
            premiere(m) <= leavingBefore &&
            premiere(m) >= leavingAfter
        )
        .sort((a, b) => posterFirst(a, b) || oldestFirst(a, b)),
      LIMITS.lastChance
    ),
    MIN_MOVIES
  );

  const nearby = atLeast(
    take(
      inTheaters.sort((a, b) => posterFirst(a, b) || newestFirst(a, b)),
      LIMITS.nearby
    ),
    cityMovieIds ? 1 : MIN_MOVIES
  );

  const comingSoonUntil = addDays(today, COMING_SOON_WITHIN_DAYS);
  const comingSoon = atLeast(
    take(
      movies
        .filter(
          (m) =>
            status(m) === 'soon' &&
            validDate(m.releaseDate) &&
            m.releaseDate <= comingSoonUntil
        )
        .sort(soonestFirst),
      LIMITS.comingSoon
    ),
    MIN_MOVIES
  );

  // The carousel shows backdrops, so it prefers movies that have one
  const heroPool = top10.length ? top10 : inTheaters;
  const hero = [
    ...heroPool.filter((m) => m.backdrop),
    ...heroPool.filter((m) => !m.backdrop),
  ].slice(0, LIMITS.hero);

  return { nearby, presale, top10, lastChance, comingSoon, hero };
}
