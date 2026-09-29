const ALIASES: Record<string, string> = {
  filme: 'filmes',
  cinema: 'cinemas',
  noticia: 'noticias',
};

export function activeRootFromPath(pathname: string): string {
  const root = pathname.replace(/^\/+/, '').split('/')[0] || 'inicio';
  return ALIASES[root] || root;
}
