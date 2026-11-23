const ALIASES: Record<string, string> = {
  filme: 'filmes',
  cinema: 'cinemas',
  noticia: 'noticias',
};

export function activeRootFromPath(pathname: string): string {
  const root = pathname.replace(/^\/+/, '').split('/')[0] || 'inicio';
  return ALIASES[root] || root;
}

export function scopeFromPath(pathname: string): string | null {
  const parts = pathname.replace(/^\/+/, '').split('/').filter(Boolean);
  return parts[0] === 'distribuidora'
    ? decodeURIComponent(parts[1] || '')
    : null;
}

/**
 * Writes a filter into the address (`replaceState`: no new history entry;
 * Next keeps `useSearchParams` in sync), so going back to a list finds it as
 * the user left it. `fallback` (the default) is left out of the URL.
 */
export function setUrlParam(name: string, value: string, fallback = '') {
  const url = new URL(window.location.href);
  if (!value || value === fallback) url.searchParams.delete(name);
  else url.searchParams.set(name, value);
  window.history.replaceState(null, '', url);
}
