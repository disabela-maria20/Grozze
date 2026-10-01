import { CATALOG_API_URL } from './CATALOG_API_URL';
import { CATALOG_CACHE_SECONDS } from './CATALOG_CACHE_SECONDS';

export class CatalogApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'CatalogApiError';
  }
}

/**
 * GET a catalog endpoint and parse its JSON. Returns `null` on 404 (unknown
 * movie or inactive cinema). Works in the browser and on the server, where
 * Next caches the response for the same five minutes as the API.
 */
export async function catalogGet<T>(path: string): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(CATALOG_API_URL + path, {
      headers: { Accept: 'application/json' },
      next: { revalidate: CATALOG_CACHE_SECONDS },
    });
  } catch {
    throw new CatalogApiError(
      'Não foi possível conectar ao catálogo. Verifique sua conexão.',
      0
    );
  }
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new CatalogApiError(
      `O catálogo respondeu com erro (HTTP ${res.status}).`,
      res.status
    );
  }
  return (await res.json()) as T;
}
