'use client';

import { cinema } from '@/shared/lib/catalog';
import { useAppStore } from '@/shared/store';
import { Icon, LinkButton, NotFound } from '@/shared/ui';

export function CinemaPage({ id }: { id: string }) {
  const cinemaSaved = useAppStore((s) => s.cinemaSaved(id));
  const openDialog = useAppStore((s) => s.openDialog);
  const c = cinema(id);

  if (!c) return <NotFound />;

  const place = [c.city, c.uf].filter(Boolean).join(' · ');

  return (
    <div className="page pt-[120px] max-sm:pt-[101px] pb-13 min-h-[65vh]">
      <div className="w-[min(1220px,calc(100%-56px))] max-sm:w-[calc(100%-32px)] mx-auto">
        <header className="mb-6.5 flex justify-between items-start gap-5 max-sm:block">
          <div>
            <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
              {c.network}
            </p>
            <h1 className="text-[48px] max-sm:text-[36px] -tracking-[0.05em] leading-[1.05] mb-3">
              {c.name}
            </h1>
            <p className="text-muted text-[15px] mb-3">{c.address}</p>
            <div className="flex gap-2 flex-wrap">
              {[
                place,
                c.roomCount
                  ? `${c.roomCount} ${c.roomCount === 1 ? 'sala' : 'salas'}`
                  : '',
                ...c.phones,
              ]
                .filter(Boolean)
                .map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1.5 border border-line rounded-full text-[#bec9bf]"
                  >
                    {t}
                  </span>
                ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              useAppStore
                .getState()
                .requestFavorite('cinema', id, `/cinema/${id}`)
            }
            aria-pressed={cinemaSaved}
            className={`min-h-[46px] px-5 py-2.5 rounded-full border border-line inline-flex items-center justify-center gap-2 text-sm font-semibold mt-4 max-sm:mt-4.5 ${
              cinemaSaved
                ? 'bg-lime! text-[#081004]! border-lime!'
                : 'text-lime'
            }`}
          >
            <Icon name="heart" />
            <span>{cinemaSaved ? 'Cinema salvo' : 'Favoritar cinema'}</span>
          </button>
        </header>
        <div className="flex items-center gap-3.5 flex-wrap mb-6">
          <button
            type="button"
            onClick={() => openDialog('prices', { cinemaId: id })}
            className="min-h-10 text-[13px] px-3.5 py-2 rounded-full bg-lime text-[#081004] font-extrabold"
          >
            Confira preços
          </button>
          {c.siteUrl && (
            <a
              className="text-[13px] inline-flex items-center gap-1.5 text-[#dce3dc] hover:text-lime transition-colors"
              href={c.siteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Site do cinema <Icon name="arrow" className="w-4 h-4" />
            </a>
          )}
          <p className="m-0 text-xs text-faint">
            Valores variam por sala, dia e tecnologia.
          </p>
        </div>
        <section className="py-8 scroll-mt-[170px]">
          <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
            Programação
          </p>
          <h2 className="text-[32px] tracking-tight mb-3">
            Sessões neste cinema
          </h2>
          <p className="text-muted text-[15px] m-0 mb-4.5 max-w-[620px]">
            Escolha um filme para ver os horários.{' '}
            {cinemaSaved
              ? 'Como este é um dos seus favoritos, ele aparece primeiro na programação.'
              : 'Favorite este cinema para vê-lo primeiro na programação de cada filme.'}
          </p>
          <LinkButton primary href="/filmes">
            Ver filmes em cartaz <Icon name="arrow" className="w-4 h-4" />
          </LinkButton>
        </section>
      </div>
    </div>
  );
}
