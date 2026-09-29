export function movieHref(id: string, scope?: string | null): string {
  return scope
    ? `/distribuidora/${encodeURIComponent(scope)}/filme/${encodeURIComponent(id)}`
    : `/filme/${encodeURIComponent(id)}`;
}
