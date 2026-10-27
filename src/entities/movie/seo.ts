import { cache } from 'react';
import type { Metadata } from 'next';
import { absoluteUrl, metaText, pageMetadata } from '@/shared/lib/seo';
import { getMovies } from './api';
import { withOverride } from './model';
import { grozzeMovieOverrides } from './overrides';
import type { Movie } from './types';

/**
 * A movie as the site shows it (catalog + CMS edits), for page metadata on
 * the server. Memoized per request: metadata and the page share one fetch.
 * Null when the catalog doesn't list it; edits are skipped if the API fails.
 */
export const getMovieForSeo = cache(
  async (id: string): Promise<Movie | null> => {
    const [movies, overrides] = await Promise.all([
      getMovies().catch(() => []),
      grozzeMovieOverrides.list().catch(() => null),
    ]);
    const base = movies.find((candidate) => candidate.id === id);
    return base ? withOverride(base, overrides?.movies[id]) : null;
  }
);

/** "1h39" / "45 min" → ISO 8601 duration ("PT1H39M"). */
function isoDuration(label: string | undefined): string | undefined {
  const match = String(label || '').match(
    /^(?:(\d+)h)?\s*(?:(\d+)\s*(?:min)?)?$/
  );
  if (!match || (!match[1] && !match[2])) return undefined;
  return `PT${match[1] ? `${Number(match[1])}H` : ''}${match[2] ? `${Number(match[2])}M` : ''}`;
}

/** schema.org `Movie` of a movie page. */
export function movieJsonLd(m: Movie, path: string) {
  const person = (name: string) => ({ '@type': 'Person', name });
  return {
    '@context': 'https://schema.org',
    '@type': 'Movie',
    name: m.t,
    url: absoluteUrl(path),
    image: m.poster || m.backdrop || undefined,
    description: metaText(m.syn, 500) || undefined,
    datePublished: m.releaseDate || undefined,
    genre: m.genre ? m.genre.split(/\s*,\s*/).filter(Boolean) : undefined,
    duration: isoDuration(m.dur),
    contentRating: m.rating
      ? m.rating === 'Livre'
        ? 'Livre'
        : `${m.rating} anos`
      : undefined,
    director: m.director ? person(m.director) : undefined,
    actor: m.cast?.length ? m.cast.map(person) : undefined,
    trailer: m.trailer
      ? {
          '@type': 'VideoObject',
          name: `Trailer de ${m.t}`,
          embedUrl: `https://www.youtube.com/embed/${m.trailer}`,
          thumbnailUrl: `https://i.ytimg.com/vi/${m.trailer}/hqdefault.jpg`,
        }
      : undefined,
  };
}

/**
 * Metadata of a movie page: title, synopsis, backdrop/poster for sharing.
 * The canonical is always `/filme/{id}` (also for a distributor hub's copy).
 */
export function moviePageMetadata(m: Movie | null, id: string): Metadata {
  const path = `/filme/${id}`;
  if (!m) return pageMetadata({ title: 'Filme', path, noindex: true });
  return pageMetadata({
    title: m.t,
    path,
    type: 'video.movie',
    description:
      m.syn ||
      `Sessões, horários e trailer de ${m.t} nos cinemas perto de você.`,
    images: [m.backdrop, m.poster],
  });
}
