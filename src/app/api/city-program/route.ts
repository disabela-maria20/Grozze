import { type CityProgram, getCityProgram } from '@/entities/movie';
import { CATALOG_CACHE_SECONDS } from '@/shared/api';
import { normalize } from '@/shared/lib/text';

const FRESH_MS = CATALOG_CACHE_SECONDS * 1000;
/** Older results aren't served, even while a new one loads. */
const STALE_MS = 6 * 60 * 60 * 1000;

/** One result per city, shared by every request to this server process. */
const cache = new Map<string, { at: number; program: Promise<CityProgram> }>();

/**
 * The program of a city, computed at most once per five minutes. A big city
 * reads dozens of cinema programs (São Paulo: ~70, slow when the catalog's
 * cache is cold), so an expired result answers at once while the new one
 * loads in the background.
 */
function cityProgram(uf: string, city: string): Promise<CityProgram> {
  const key = `${normalize(uf)}|${normalize(city)}`;
  const previous = cache.get(key);
  const age = previous ? Date.now() - previous.at : Infinity;
  if (previous && age < FRESH_MS) return previous.program;

  const program = getCityProgram(uf, city);
  cache.set(key, { at: Date.now(), program });
  program.then(
    // Names that aren't catalog cities don't take memory
    (result) => !result.cinemas && cache.delete(key),
    // On failure the previous result stays (and the next request retries)
    () => (previous ? cache.set(key, previous) : cache.delete(key))
  );
  return previous && age < STALE_MS ? previous.program : program;
}

/**
 * `GET /api/city-program/?uf=SP&city=Campinas`: the movies with upcoming
 * sessions in a city, and how many sessions each has there. Lets the lists
 * show only what the user can watch where they are.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uf = (searchParams.get('uf') || '').trim();
  const city = (searchParams.get('city') || '').trim().slice(0, 80);
  if (!/^[A-Za-z]{2}$/.test(uf) || !city) {
    return Response.json({ error: 'Informe uf e city.' }, { status: 400 });
  }
  try {
    return Response.json(await cityProgram(uf, city), {
      headers: {
        'Cache-Control': `public, max-age=60, s-maxage=${CATALOG_CACHE_SECONDS}, stale-while-revalidate=${CATALOG_CACHE_SECONDS}`,
      },
    });
  } catch {
    return Response.json(
      { error: 'Não foi possível consultar o catálogo agora.' },
      { status: 502 }
    );
  }
}
