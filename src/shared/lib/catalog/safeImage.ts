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
