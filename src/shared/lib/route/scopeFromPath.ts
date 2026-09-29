export function scopeFromPath(pathname: string): string | null {
  const parts = pathname.replace(/^\/+/, '').split('/').filter(Boolean);
  return parts[0] === 'distribuidora'
    ? decodeURIComponent(parts[1] || '')
    : null;
}
