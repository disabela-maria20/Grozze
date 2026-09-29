'use client';

import { useMemo, useState } from 'react';
import { cinema } from '@/shared/lib/catalog/cinema';
import { cinemaDates } from '@/shared/lib/catalog/cinemaDates';
import { dateParts } from '@/shared/lib/catalog/dateParts';
import { groupedRooms } from '@/shared/lib/catalog/groupedRooms';
import { movie } from '@/shared/lib/catalog/movie';
import { unique } from '@/shared/lib/catalog/unique';
import { SESSIONS } from '@/shared/lib/catalog/SESSIONS';
import { useAppStore } from '@/shared/store/useAppStore';
import { MoviePoster } from '@/features/movies';
import { NotFound } from '@/shared/ui/NotFound';
import { Rail } from '@/shared/ui/Rail';
import { Icon } from '@/shared/ui/Icon';

function HourButtons({ rows }: { rows: (typeof SESSIONS)[number][] }) {
  const openDialog = useAppStore((s) => s.openDialog);
  return (
    <div className="flex flex-wrap gap-2">
      {rows.map((s) => (
        <button
          key={s.id}
          type="button"
          className="min-w-[78px] h-[47px] inline-flex items-center justify-center border border-lime/25 rounded-xl bg-[#0c140d] text-white text-[15px] font-bold hover:bg-lime hover:text-[#081004] transition-colors"
          onClick={() => openDialog('session', { sessionId: s.id })}
        >
          {s.time}
        </button>
      ))}
    </div>
  );
}

export function CinemaPage({ id }: { id: string }) {
  const content = useAppStore((s) => s.content);
  const cinemaSaved = useAppStore((s) => s.cinemaSaved(id));
  const openDialog = useAppStore((s) => s.openDialog);
  const c = cinema(id);
  const dates = useMemo(() => cinemaDates(id), [id]);
  const [date, setDate] = useState(dates[0] || '');

  if (!c) return <NotFound />;

  const rows = SESSIONS.filter((s) => s.theater === id && s.date === date);
  const movieIds = unique(rows.map((s) => s.movie));

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
              <span className="text-xs px-2.5 py-1.5 border border-line rounded-full text-[#bec9bf]">
                {c.roomCount} {c.roomCount === 1 ? 'sala' : 'salas'}
              </span>
              {c.tech.map((t) => (
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
          <p className="m-0 text-xs text-faint">
            Valores variam por sala, dia e tecnologia.
          </p>
        </div>
        <section className="py-8 scroll-mt-[170px]">
          <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
            Programação
          </p>
          <h2 className="text-[32px] tracking-tight mb-5">
            Sessões neste cinema
          </h2>
          <Rail aria-label="Datas de sessão">
            {dates.map((d) => {
              const p = dateParts(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDate(d)}
                  aria-pressed={date === d}
                  className={`shrink-0 flex-none w-[100px] min-h-[74px] border border-line rounded-2xl bg-[#0b100d] text-app-text text-left px-3.5 py-3 ${
                    date === d ? 'bg-lime! text-[#081004]! border-lime!' : ''
                  }`}
                >
                  <b className="text-[17px] block">
                    {p.day} {p.month}
                  </b>
                  <span
                    className={`text-[11px] mt-0.5 block ${date === d ? 'text-[#40502c]' : 'text-muted'}`}
                  >
                    {p.weekday}
                  </span>
                </button>
              );
            })}
          </Rail>
          <div className="grid gap-1 mt-4">
            {movieIds.length ? (
              movieIds.map((mid) => {
                const m = movie(mid, content)!;
                const movieRows = rows.filter((s) => s.movie === mid);
                return (
                  <article
                    key={mid}
                    className="grid grid-cols-[83px_1fr] gap-5 border-t border-line py-6 first:border-0"
                  >
                    <a href={`/filme/${mid}`} aria-label={`Ver ${m.t}`}>
                      <MoviePoster m={m} className="w-[83px] rounded-[10px]" />
                    </a>
                    <div>
                      <h3 className="text-[23px] -tracking-[0.03em] m-0 mb-1.5">
                        <a href={`/filme/${mid}`}>{m.t}</a>
                      </h3>
                      <div className="text-[13px] text-muted mb-3">
                        {[m.genre, m.dur].filter(Boolean).join(' · ')}
                      </div>
                      {groupedRooms(movieRows).map((rr) => (
                        <div
                          key={rr[0].room + rr[0].tech + rr[0].lang}
                          className="mt-3.5 p-3.5 border border-line rounded-[13px] bg-white/[0.015] first:mt-0"
                        >
                          <div className="flex items-baseline gap-2.5 flex-wrap mb-2.5">
                            <strong className="text-xs tracking-wide text-lime">
                              {rr[0].room}
                            </strong>
                            <span className="text-[13px] text-muted">
                              {rr[0].tech} · {rr[0].lang}
                            </span>
                          </div>
                          <HourButtons rows={rr} />
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="border border-line rounded-app p-5 bg-surface text-muted">
                Não há sessões nesta data.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
