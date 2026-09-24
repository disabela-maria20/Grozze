import { useMemo, useState } from "react";
import { allMovies, dateLabel, movieHref, normalize, sortedCinemas, statusLabel } from "../../../lib/catalog";
import { useAppStore } from "../../../lib/store";
import { Icon } from "../Icon";

export function SearchDialog({ scope }: { scope?: string | null }) {
  const [q, setQ] = useState("");
  const content = useAppStore((s) => s.content);
  const cinemaSaved = useAppStore((s) => s.cinemaSaved);

  const { movies, cinemas } = useMemo(() => {
    const n = normalize(q);
    const ms = allMovies(content)
      .filter((m) => (!scope || m.dist === scope) && normalize(m.t + " " + m.genre).includes(n))
      .slice(0, 7);
    const cs = scope
      ? []
      : sortedCinemas(cinemaSaved)
          .filter((c) => normalize(c.name + " " + c.address).includes(n))
          .slice(0, 4);
    return { movies: ms, cinemas: cs };
  }, [q, scope, content]);

  const hasResults = movies.length || cinemas.length;

  return (
    <div>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-4 pr-10">Buscar</h2>
      <label className="flex items-center gap-2.5 flex-1 min-w-0 min-h-[52px] rounded-2xl border border-line bg-surface px-4">
        <Icon name="search" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filme, cinema ou bairro"
          aria-label="Buscar em todo o catálogo"
          className="min-w-0 w-full text-app-text border-0 outline-none bg-transparent text-base h-[50px]"
        />
      </label>
      <div className="mt-4">
        {!hasResults && <p className="text-muted">Nenhum resultado encontrado.</p>}
        {movies.map((m) => (
          <a key={m.id} className="block mb-1.5 p-4 rounded-2xl border border-line bg-surface2" href={movieHref(m.id, scope)}>
            <strong className="block">{m.t}</strong>
            <small className="text-muted text-xs mt-1.5 block">
              {statusLabel(m)} · {dateLabel(m.releaseDate)}
            </small>
          </a>
        ))}
        {cinemas.map((c) => (
          <a key={c.id} className="block mb-1.5 p-4 rounded-2xl border border-line bg-surface2" href={`/cinema/${c.id}`}>
            <strong className="block">{c.name}</strong>
            <small className="text-muted text-xs mt-1.5 block">Cinema</small>
          </a>
        ))}
      </div>
    </div>
  );
}
