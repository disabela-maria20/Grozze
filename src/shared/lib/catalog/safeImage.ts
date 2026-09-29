export function safeImage(value: unknown): string {
  const s = String(value || '').trim();
  if (/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(s))
    return s;
  try {
    const u = new URL(s);
    return u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
}
