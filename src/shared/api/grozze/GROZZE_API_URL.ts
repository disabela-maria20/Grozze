/** Grozze API in production; the dev server talks to the local backend. */
const DEFAULT_GROZZE_API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://apigrozze.isabelamribeiro.com.br/api'
    : 'http://localhost:3001/api';

/**
 * Base URL of the Grozze API (auth, account, signup lists), including `/api`.
 * `NEXT_PUBLIC_GROZZE_API_URL` overrides it (e.g. a staging API).
 */
export const GROZZE_API_URL = (
  process.env.NEXT_PUBLIC_GROZZE_API_URL || DEFAULT_GROZZE_API_URL
).replace(/\/+$/, '');
