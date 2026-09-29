export function videoId(v: unknown): string {
  const value = String(v || '').trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  try {
    const u = new URL(value);
    if (/(^|\.)youtube\.com$/.test(u.hostname)) {
      const id = u.searchParams.get('v') || u.pathname.split('/').pop() || '';
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : '';
    }
    if (u.hostname === 'youtu.be') return videoId(u.pathname.slice(1));
  } catch {
    /* not a URL */
  }
  return '';
}
