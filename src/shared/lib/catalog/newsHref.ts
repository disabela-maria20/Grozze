export function newsHref(id: string, scope?: string | null): string {
  return scope
    ? `/distribuidora/${encodeURIComponent(scope)}/noticia/${encodeURIComponent(id)}`
    : `/noticia/${encodeURIComponent(id)}`;
}
