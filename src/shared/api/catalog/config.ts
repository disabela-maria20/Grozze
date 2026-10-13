/** Base URL of the public catalog API (movies, cinemas and showtimes). */
export const CATALOG_API_URL = (
  process.env.NEXT_PUBLIC_CATALOG_API_URL || 'https://api.vibezz.com'
).replace(/\/+$/, '');

/** The API caches its results for five minutes; refetching sooner is useless. */
export const CATALOG_CACHE_SECONDS = 300;

/** Where the image files named by the catalog API (`vibezz_123.png`) live. */
export const CATALOG_IMAGE_URL = (
  process.env.NEXT_PUBLIC_CATALOG_IMAGE_URL || 'https://assets.cine3.com.br'
).replace(/\/+$/, '');
