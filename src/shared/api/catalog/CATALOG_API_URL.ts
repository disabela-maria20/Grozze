/** Base URL of the public catalog API (movies, cinemas and showtimes). */
export const CATALOG_API_URL = (
  process.env.NEXT_PUBLIC_CATALOG_API_URL || 'https://api.vibezz.com'
).replace(/\/+$/, '');
