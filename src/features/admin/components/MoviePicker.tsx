'use client';

import { useMemo, useState } from 'react';
import { allMovies } from '@/entities/movie';
import { useAppStore } from '@/shared/store';
import { inputClass } from '@/shared/ui';

/**
 * Seleção de filmes relacionados por NOME (não por id). Lista o catálogo já
 * carregado (CatalogGate), busca por título e guarda os ids escolhidos na ordem.
 * `max` limita a seleção; `reorderable` mostra setas para mudar a ordem.
 */
export function MoviePicker({
  value,
  onChange,
  max,
  reorderable = false,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  max?: number;
  reorderable?: boolean;
}) {
  const content = useAppStore((s) => s.content);
  const movies = useMemo(() => allMovies(content), [content]);
  const titleById = useMemo(
    () => new Map(movies.map((m) => [m.id, m.t])),
    [movies]
  );
  const [search, setSearch] = useState('');
  const selectedSet = useMemo(() => new Set(value), [value]);

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = term
      ? movies.filter((m) => m.t.toLowerCase().includes(term))
      : movies;
    return list.slice(0, 40);
  }, [movies, search]);

  const full = max !== undefined && value.length >= max;

  const toggle = (id: string) => {
    if (selectedSet.has(id)) onChange(value.filter((v) => v !== id));
    else if (!full) onChange([...value, id]);
  };

  /** Swaps the movie at `index` with its neighbor (`step` -1 or 1). */
  const move = (index: number, step: number) => {
    const next = [...value];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    onChange(next);
  };

  return (
    <div className="border border-line rounded-xl p-3 bg-[#080e0a]">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {value.map((id, index) => (
            <span
              key={id}
              className="inline-flex items-center gap-1.5 bg-lime-soft text-lime rounded-full pl-2.5 pr-1 py-0.5 text-[13px] font-semibold"
            >
              {reorderable && (
                <span className="text-faint text-[11px]">{index + 1}.</span>
              )}
              {titleById.get(id) ?? `#${id}`}
              {reorderable && (
                <>
                  <button
                    type="button"
                    aria-label="Mover para antes"
                    className="w-4 h-4 grid place-items-center rounded-full hover:bg-lime/20 disabled:opacity-30"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    aria-label="Mover para depois"
                    className="w-4 h-4 grid place-items-center rounded-full hover:bg-lime/20 disabled:opacity-30"
                    disabled={index === value.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    ›
                  </button>
                </>
              )}
              <button
                type="button"
                aria-label="Remover"
                className="w-4 h-4 grid place-items-center rounded-full hover:bg-lime/20"
                onClick={() => toggle(id)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        className={inputClass}
        placeholder="Buscar filme por nome…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mt-2 max-h-[220px] overflow-auto border border-line rounded-lg">
        {results.length === 0 ? (
          <p className="text-muted text-sm p-3">Nenhum filme encontrado.</p>
        ) : (
          results.map((m) => {
            const active = selectedSet.has(m.id);
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => toggle(m.id)}
                disabled={full && !active}
                className={`flex items-center gap-2 w-full text-left px-3 py-2 text-[13px] border-b border-line last:border-0 disabled:opacity-40 ${
                  active ? 'bg-lime-soft text-lime font-semibold' : ''
                }`}
              >
                <span
                  className={`w-4 h-4 rounded border grid place-items-center shrink-0 text-[10px] ${
                    active
                      ? 'bg-lime! text-[#081004]! border-lime!'
                      : 'border-line'
                  }`}
                >
                  {active ? '✓' : ''}
                </span>
                <span className="truncate">{m.t}</span>
              </button>
            );
          })
        )}
      </div>
      <p className="text-[11px] text-faint mt-1.5">
        {value.length}
        {max !== undefined && ` de ${max}`} filme(s) selecionado(s).
      </p>
    </div>
  );
}
