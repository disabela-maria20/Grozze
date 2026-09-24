"use client";

import { useEffect, useMemo, useState } from "react";
import { movieList, normalize, SESSIONS, status } from "@/shared/lib/catalog";
import { useAppStore } from "@/shared/store/store";
import { MovieCard } from "@/shared/ui/MovieCard";
import { Chip, EmptyState, Rail, TextLink } from "@/shared/ui/ui";
import { Icon } from "@/shared/ui/Icon";

const STATUS_OPTIONS: [string, string][] = [
  ["all", "Todos"],
  ["now", "Em cartaz"],
  ["presale", "Pré-venda"],
];
const FORMATS = ["IMAX", "VIP", "4DX", "LED"];

export function CatalogApp() {
  const content = useAppStore((s) => s.content);
  const [query, setQuery] = useState("");
  const [filmStatus, setFilmStatus] = useState("all");
  const [filmFormat, setFilmFormat] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("status")) setFilmStatus(params.get("status")!);
  }, []);

  const list = useMemo(() => {
    const q = normalize(query);
    return movieList(content).filter(
      (m) =>
        (!q || normalize(m.t + " " + m.genre).includes(q)) &&
        (filmStatus === "all" || status(m) === filmStatus) &&
        (filmFormat === "all" || SESSIONS.some((s) => s.movie === m.id && s.tech === filmFormat)),
    );
  }, [query, filmStatus, filmFormat, content]);

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <header className="mb-6.5">
          <h1 className="text-[48px] max-sm:text-[38px] -tracking-[0.05em] leading-[1.05] mb-3">Filmes</h1>
        </header>
        <div className="flex gap-4 items-center flex-wrap mb-5 max-sm:block">
          <label className="flex items-center gap-2.5 flex-1 min-w-[260px] min-h-[52px] rounded-2xl border border-line bg-surface px-4 max-sm:min-h-12 max-sm:mb-2.5">
            <Icon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar filme ou gênero"
              aria-label="Buscar filme ou gênero"
              className="min-w-0 w-full text-app-text border-0 outline-none bg-transparent text-base h-[50px] max-sm:h-[46px]"
            />
          </label>
          <Rail className="flex-none w-auto max-sm:w-full">
            {STATUS_OPTIONS.map(([v, l]) => (
              <Chip key={v} active={filmStatus === v} onClick={() => setFilmStatus(v)}>
                {l}
              </Chip>
            ))}
            {FORMATS.map((f) => (
              <Chip key={f} active={filmFormat === f} onClick={() => setFilmFormat((cur) => (cur === f ? "all" : f))}>
                {f}
              </Chip>
            ))}
          </Rail>
        </div>
        <div className="text-[13px] text-muted mb-4">
          {list.length} {list.length === 1 ? "filme" : "filmes"}
        </div>
        {list.length ? (
          <div className="grid grid-cols-6 max-lg:grid-cols-5 max-md:grid-cols-4 max-sm:grid-cols-2 gap-x-4 gap-y-6 max-sm:gap-x-3.5 max-sm:gap-y-5.5">
            {list.map((m) => (
              <MovieCard key={m.id} m={m} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhum filme encontrado">
            <p>Tente outro título ou remova um filtro.</p>
            <TextLink
              onClick={() => {
                setQuery("");
                setFilmStatus("all");
                setFilmFormat("all");
              }}
            >
              Limpar busca e filtros
            </TextLink>
          </EmptyState>
        )}
      </div>
    </div>
  );
}
