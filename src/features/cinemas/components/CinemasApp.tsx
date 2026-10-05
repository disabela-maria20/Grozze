'use client';

import { useMemo, useState } from 'react';
import { inLocation, normalize, sortedCinemas } from '@/shared/lib/catalog';
import { useAppStore, useIsSaved } from '@/shared/store';
import { CinemaCard } from './CinemaCard';
import { EmptyState, Icon } from '@/shared/ui';

export function CinemasApp() {
  const cinemaSaved = useIsSaved('cinema');
  const authStatus = useAppStore((s) => s.authStatus);
  const location = useAppStore((s) => s.location);
  const [query, setQuery] = useState('');
  const [mapOpen, setMapOpen] = useState(false);

  const visibleCinemas = useMemo(() => {
    const normalizedQuery = normalize(query);
    // Searching looks nationwide; the default list stays near the user
    return sortedCinemas(cinemaSaved, location.coords).filter((candidate) => {
      if (normalizedQuery) {
        const searchableText = [
          candidate.name,
          candidate.address,
          candidate.city,
        ].join(' ');
        return normalize(searchableText).includes(normalizedQuery);
      }
      return cinemaSaved(candidate.id) || inLocation(candidate, location);
    });
    // Hearting a cinema doesn't reorder the list under the cursor; logging in
    // or restoring the session (favorites arriving) does
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, location, authStatus]);

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <header className="mb-6.5">
          <h1 className="text-[48px] max-sm:text-[38px] -tracking-[0.05em] leading-[1.05] mb-3">
            Cinemas
          </h1>
        </header>
        <div className="flex gap-4 items-center flex-wrap mb-5 max-sm:block">
          <label className="flex items-center gap-2.5 flex-1 min-w-[260px] min-h-[52px] rounded-2xl border border-line bg-surface px-4 max-sm:min-h-12 max-sm:mb-2.5">
            <Icon name="search" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cinema, bairro ou cidade"
              aria-label="Buscar cinema, bairro ou cidade"
              className="min-w-0 w-full text-app-text border-0 outline-none bg-transparent text-base h-[50px] max-sm:h-[46px]"
            />
          </label>
        </div>
        <div className="grid grid-cols-[0.95fr_1.05fr] max-md:grid-cols-1 gap-6.5">
          <div className="sticky top-[104px] h-[440px] max-md:static max-md:h-[280px] border border-line rounded-[20px] overflow-hidden bg-[radial-gradient(circle_at_50%_40%,#26382b,#0c140e)] grid place-items-center text-center">
            {mapOpen ? (
              <iframe
                title="Mapa de cinemas em São Paulo"
                src="https://maps.google.com/maps?q=cinemas%20S%C3%A3o%20Paulo&z=12&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer"
                className="w-full h-full border-0"
              />
            ) : (
              <div className="p-7.5 max-w-[370px]">
                <Icon name="pin" className="mx-auto mb-3.5 w-9 h-9 text-lime" />
                <h2 className="text-2xl leading-tight mb-2.5">
                  Veja os cinemas no mapa
                </h2>
                <p className="text-muted text-sm mb-3.5">
                  O mapa é carregado somente quando você escolher abri-lo.
                </p>
                <button
                  type="button"
                  onClick={() => setMapOpen(true)}
                  className="min-h-[46px] px-5 py-2.5 rounded-full border border-line bg-white/[0.035] inline-flex items-center justify-center gap-2 text-sm font-semibold hover:bg-lime-soft hover:border-lime/40 transition-colors"
                >
                  Abrir mapa
                </button>
              </div>
            )}
          </div>
          <div className="grid gap-3">
            {visibleCinemas.length ? (
              visibleCinemas.map((cinema) => (
                <CinemaCard key={cinema.id} c={cinema} />
              ))
            ) : (
              <EmptyState>Nenhum cinema para esta busca.</EmptyState>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
