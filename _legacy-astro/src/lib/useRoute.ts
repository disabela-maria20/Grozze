import { useEffect, useState } from "react";

/** Current pathname, kept in sync for islands that need to know "where am I" (active nav link, scope). */
export function usePathname(): string {
  const [path, setPath] = useState(() => (typeof window !== "undefined" ? window.location.pathname : "/"));
  useEffect(() => {
    const onNav = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onNav);
    return () => window.removeEventListener("popstate", onNav);
  }, []);
  return path;
}

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
