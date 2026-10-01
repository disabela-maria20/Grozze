/** Where the image files named by the catalog API (`vibezz_123.png`) live. */
export const CATALOG_IMAGE_URL = (
  process.env.NEXT_PUBLIC_CATALOG_IMAGE_URL || 'https://assets.cine3.com.br'
).replace(/\/+$/, '');
