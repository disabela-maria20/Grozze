export const CATALOG_API_URL = (
  process.env.NEXT_PUBLIC_CATALOG_API_URL || 'api-grozze.vibezz.com'
).replace(/\/+$/, '');

export const CATALOG_CACHE_SECONDS = 300;

export const CATALOG_IMAGE_URL = (
  process.env.NEXT_PUBLIC_CATALOG_IMAGE_URL || 'https://assets.cine3.com.br'
).replace(/\/+$/, '');
