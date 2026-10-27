'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { nearbyCities, stateName } from '@/entities/cinema';
import { cityProgramQuery } from '@/entities/movie';
import { useAppStore } from '@/shared/store';
import { Icon, TextLink } from '@/shared/ui';

/** "1 cinema" / "3 cinemas"; same for movies. */
const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

/**
 * "Explorar cidades próximas": the closest cities with cinemas, each with
 * how many movies it's showing (loaded per city). Picking one switches the
 * location the lists use; the device position isn't touched.
 */
export function NearbyCitiesDialog() {
  const location = useAppStore((s) => s.location);
  const setLocationManual = useAppStore((s) => s.setLocationManual);
  const openDialog = useAppStore((s) => s.openDialog);
  const cities = useMemo(() => nearbyCities(location), [location]);
  const programs = useQueries({
    queries: cities.map((city) => cityProgramQuery(city.uf, city.city)),
  });

  return (
    <div>
      <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
        Mais sessões
      </p>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">
        Cidades próximas
      </h2>
      <p className="text-sm text-muted leading-relaxed mb-5">
        {location.city
          ? `Perto de ${location.city}, com filmes em cartaz. Escolha uma para ver os filmes e as sessões de lá.`
          : 'Escolha uma cidade para ver os filmes e as sessões de lá.'}
      </p>
      {cities.length ? (
        <ul className="grid gap-2.5 m-0 p-0 list-none">
          {cities.map((city, index) => {
            const program = programs[index];
            return (
              <li key={`${city.uf}|${city.city}`}>
                <button
                  type="button"
                  onClick={() =>
                    setLocationManual({ city: city.city, uf: city.uf })
                  }
                  className="w-full text-left border border-line rounded-2xl bg-surface px-4.5 py-3.5 flex items-center gap-3.5 hover:border-lime/40 hover:bg-lime-soft transition-colors"
                >
                  <Icon name="pin" className="w-5 h-5 text-lime shrink-0" />
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate">
                      {city.city}
                      <span className="text-muted font-normal">
                        {' '}
                        · {stateName(city.uf)}
                      </span>
                    </strong>
                    <small className="block text-xs text-muted mt-1">
                      {Math.max(1, Math.round(city.km))} km ·{' '}
                      {plural(city.cinemas, 'cinema', 'cinemas')}
                    </small>
                  </span>
                  <span className="text-[13px] text-lime whitespace-nowrap shrink-0">
                    {program.data ? (
                      plural(program.data.size, 'filme', 'filmes')
                    ) : program.isError ? null : (
                      <span
                        aria-label="Carregando filmes"
                        className="skeleton inline-block w-14 h-3 rounded-full align-middle"
                      />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="border border-line rounded-app p-5 bg-surface text-muted m-0">
          Não encontramos outras cidades com cinemas por perto.
        </p>
      )}
      <p className="text-sm text-muted mt-5 m-0">
        Procurando outro lugar?{' '}
        <TextLink onClick={() => openDialog('location')}>
          Escolher estado e cidade
        </TextLink>
      </p>
    </div>
  );
}
