/** Base URL of the Grozze API (signup support lists), including `/api`. */
export const GROZZE_API_URL = (
  process.env.NEXT_PUBLIC_GROZZE_API_URL || 'http://localhost:3001/api'
).replace(/\/+$/, '');
