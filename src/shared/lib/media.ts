/** Returns the value when it is a base64 image data URI or an HTTPS URL, else ''. */
export function safeImage(value: unknown): string {
  const text = String(value || '').trim();
  if (/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(text))
    return text;
  try {
    const url = new URL(text);
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

/** A YouTube video id: 11 URL-safe characters. */
const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts a YouTube video id from a bare id, a youtube.com URL
 * (`?v=` or last path segment) or a youtu.be link. '' when none is found.
 */
export function videoId(input: unknown): string {
  const value = String(input || '').trim();
  if (YOUTUBE_ID.test(value)) return value;
  try {
    const url = new URL(value);
    if (/(^|\.)youtube\.com$/.test(url.hostname)) {
      const id =
        url.searchParams.get('v') || url.pathname.split('/').pop() || '';
      return YOUTUBE_ID.test(id) ? id : '';
    }
    if (url.hostname === 'youtu.be') return videoId(url.pathname.slice(1));
  } catch {
    /* not a URL */
  }
  return '';
}
