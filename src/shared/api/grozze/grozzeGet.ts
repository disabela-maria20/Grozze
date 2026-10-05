import { GROZZE_API_KEY } from './GROZZE_API_KEY';
import { GROZZE_API_URL } from './GROZZE_API_URL';
import type { GrozzeErrorBody } from './grozzeTypes';

export class GrozzeApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'GrozzeApiError';
  }
}

/** The first field error of a 422, which says more than the generic message. */
function errorMessage(body: GrozzeErrorBody | null, status: number): string {
  const firstDetail = Object.values(body?.details ?? {}).find(
    (messages) => messages?.length
  )?.[0];
  return (
    firstDetail ||
    body?.message ||
    `A API da Grozze respondeu com erro (HTTP ${status}).`
  );
}

export interface GrozzeRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Access token sent as `Authorization: Bearer`. */
  accessToken?: string | null;
}

/**
 * Calls a Grozze API endpoint with the client key. Cookies go along
 * (`credentials: 'include'`) because the session's refresh token lives in an
 * httpOnly cookie. Any API error becomes a `GrozzeApiError` carrying the
 * API's own message (already in Portuguese).
 */
export async function grozzeRequest<T>(
  path: string,
  { method = 'GET', body, accessToken }: GrozzeRequestOptions = {}
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(GROZZE_API_URL + path, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'x-api-key': GROZZE_API_KEY,
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new GrozzeApiError(
      'Não foi possível conectar à API da Grozze. Verifique sua conexão.',
      0
    );
  }
  // 204 No Content (logout, password changes...) has no body
  const data: unknown =
    res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    throw new GrozzeApiError(
      errorMessage(data as GrozzeErrorBody | null, res.status),
      res.status
    );
  }
  return data as T;
}

/** GET a public Grozze API list. */
export const grozzeGet = <T>(path: string) => grozzeRequest<T>(path);
