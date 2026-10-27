/**
 * Image hosts served through Next's optimizer: resized to the size shown,
 * converted to WebP and cached. Catalog posters come at 4096×6144 (~3 MB)
 * and are shown at ~200px, so this is most of the page weight.
 *
 * Any other host (a URL typed in the CMS) loads as it is, so the server
 * doesn't become an open proxy for images from anywhere.
 */
export const OPTIMIZED_IMAGE_HOSTS = [
  // Catalog posters and banners
  'assets.cine3.com.br',
  // Cinema network logos
  'ingresso-a.akamaihd.net',
  // YouTube thumbnails
  'i.ytimg.com',
  // Images uploaded in the CMS (S3 bucket, directly or behind its own domain)
  '*.amazonaws.com',
  'assets.grozze.com',
  'assets.grozze.com.com',
];

/** Whether `src` is on a host the optimizer may fetch from. */
export function canOptimizeImage(src: string): boolean {
  let host: string;
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') return false;
    host = url.hostname;
  } catch {
    return false;
  }
  return OPTIMIZED_IMAGE_HOSTS.some((pattern) =>
    pattern.startsWith('*.')
      ? host.endsWith(pattern.slice(1))
      : host === pattern
  );
}
