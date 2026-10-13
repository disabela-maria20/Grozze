/** Grozze API in production; the dev server talks to the local backend. */
const DEFAULT_GROZZE_API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://grozze-auth.vibezz.com/api'
    : 'http://localhost:3001/api';

/**
 * Base URL of the Grozze API (auth, account, signup lists), including `/api`.
 * `NEXT_PUBLIC_GROZZE_API_URL` overrides it (e.g. a staging API).
 */
export const GROZZE_API_URL = (
  process.env.NEXT_PUBLIC_GROZZE_API_URL || DEFAULT_GROZZE_API_URL
).replace(/\/+$/, '');

/**
 * Client key sent as `x-api-key`. It ships to the browser (visible in
 * DevTools): it identifies the client and limits abuse, it doesn't protect
 * user data. Empty when not configured; the lists then use local fallbacks.
 */
export const GROZZE_API_KEY = process.env.NEXT_PUBLIC_GROZZE_API_KEY || '';

/** The API caches its lists for 24 hours; refetching sooner is useless. */
export const GROZZE_CACHE_SECONDS = 24 * 60 * 60;
