import { GROZZE_API_KEY, GROZZE_API_URL } from './config';
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

/**
 * After a failed connection (API down, or the browser blocking it by CORS)
 * the browser stops calling for a while: every request would fail the same
 * way, and a page fires several at once.
 */
const UNREACHABLE_COOLDOWN_MS = 30_000;
let unreachableUntil = 0;

const unreachable = () =>
  new GrozzeApiError(
    'A API da Grozze está indisponível no momento. Tente novamente em instantes.',
    0
  );

/**
 * Retry policy for Grozze queries: once, and only for server errors (5xx).
 * Client errors (4xx) and an unreachable API (0) won't change on retry.
 */
export const retryGrozzeQuery = (failureCount: number, err: unknown) =>
  failureCount < 1 && (!(err instanceof GrozzeApiError) || err.status >= 500);

export interface GrozzeRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Sent as JSON, or as multipart/form-data when it's a `FormData` (file uploads). */
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
  // Only the browser: on the server one failure would hide the API for
  // every visitor's render
  const inBrowser = typeof window !== 'undefined';
  if (inBrowser && Date.now() < unreachableUntil) throw unreachable();
  // The browser sets the multipart boundary itself
  const multipart = body instanceof FormData;
  let res: Response;
  try {
    res = await fetch(GROZZE_API_URL + path, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'x-api-key': GROZZE_API_KEY,
        ...(body !== undefined &&
          !multipart && { 'Content-Type': 'application/json' }),
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body:
        body === undefined
          ? undefined
          : multipart
            ? body
            : JSON.stringify(body),
    });
  } catch {
    // fetch can't tell a CORS block from a network failure: both land here
    if (inBrowser) unreachableUntil = Date.now() + UNREACHABLE_COOLDOWN_MS;
    throw unreachable();
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
