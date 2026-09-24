const ALIASES: Record<string, string> = {
  filme: "filmes",
  cinema: "cinemas",
  noticia: "noticias",
};

export function activeRootFromPath(pathname: string): string {
  const root = pathname.replace(/^\/+/, "").split("/")[0] || "inicio";
  return ALIASES[root] || root;
}

export function scopeFromPath(pathname: string): string | null {
  const parts = pathname.replace(/^\/+/, "").split("/").filter(Boolean);
  return parts[0] === "distribuidora" ? decodeURIComponent(parts[1] || "") : null;
}
