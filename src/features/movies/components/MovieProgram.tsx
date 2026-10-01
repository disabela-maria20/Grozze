'use client';

import { useMemo, useState } from 'react';
import {
  cinema,
  dateLabel,
  dateParts,
  defaultFilmState,
  filterGroupOptions,
  filterRows,
  groupedRooms,
  inLocation,
  movieDates,
  validDate,
  type SessionFilterState,
} from '@/shared/lib/catalog';
import { useMovieShowtimesQuery } from '@/shared/api';
import { useAppStore } from '@/shared/store';
import type { Movie, Showtime } from '@/shared/lib/types';
import { HeartButton, Rail, TextLink, Icon } from '@/shared/ui';

function HourButtons({ rows }: { rows: Showtime[] }) {
  const openDialog = useAppStore((s) => s.openDialog);
  return (
    <div className="flex flex-wrap gap-2">
      {rows.map((s) => (
        <button
          key={s.id}
          type="button"
          className="min-w-[78px] h-[47px] inline-flex items-center justify-center border border-lime/25 rounded-xl bg-[#0c140d] text-white text-[15px] font-bold hover:bg-lime hover:text-[#081004] transition-colors"
          aria-label={`${s.time} · ${dateLabel(s.date)} · ${s.room} · ${s.tech} · ${s.lang}`}
          onClick={() => openDialog('session', { sessionId: s.id })}
        >
          {s.time}
        </button>
      ))}
    </div>
  );
}

function RoomBlocks({
  rows,
  preferences,
}: {
  rows: Showtime[];
  preferences?: { language?: string; format?: string };
}) {
  return (
    <>
      {groupedRooms(rows, preferences).map((rr) => (
        <div
          key={rr[0].room + rr[0].tech + rr[0].lang}
          className="mt-4.5 first:mt-0"
        >
          <div className="flex items-baseline gap-2.5 flex-wrap mb-2.5 leading-tight">
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
    </>
  );
}

function CinemaSessionsBlock({
  cid,
  rows,
  scope,
}: {
  cid: string;
  rows: Showtime[];
  scope?: string | null;
}) {
  const preferences = useAppStore((s) => s.profile()?.preferences);
  const c = cinema(cid);
  return (
    <article className="py-5.5 first:pt-2.5 border-t border-line first:border-0">
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <h3 className="text-[23px] leading-[1.15] -tracking-[0.03em] m-0 mb-1.5">
            {c?.name || 'Cinema'}
          </h3>
          <p className="text-[13px] text-muted m-0 break-words">
            {c?.address || ''}
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <HeartButton kind="cinema" id={cid} path="" />
          {!scope && (
            <a
              className="text-xs inline-flex items-center gap-1 text-[#dce3dc] hover:text-lime"
              href={`/cinema/${cid}`}
            >
              Ver cinema <Icon name="arrow" className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
      <RoomBlocks rows={rows} preferences={preferences} />
    </article>
  );
}

function FavoriteDiscovery() {
  const openDialog = useAppStore((s) => s.openDialog);
  return (
    <section className="grid grid-cols-[42px_1fr_auto] items-center gap-4 p-5 max-sm:p-4 border border-lime/24 rounded-app bg-gradient-to-r from-lime-soft to-[rgba(200,255,57,.015)] mb-6 max-sm:grid-cols-[32px_1fr] max-sm:gap-2.5">
      <span
        className="w-[42px] h-[42px] max-sm:w-8 max-sm:h-8 rounded-2xl bg-lime-soft text-lime grid place-items-center"
        aria-hidden
      >
        <Icon name="heart" />
      </span>
      <div className="min-w-0 max-sm:col-start-2">
        <h3 className="text-xl leading-tight -tracking-[0.035em] m-0 mb-1.5">
          Seus cinemas, primeiro.
        </h3>
        <p className="text-[13px] text-muted m-0 max-w-[410px]">
          Favorite os cinemas de que você gosta para vê-los em prioridade na
          programação.
        </p>
      </div>
      <button
        type="button"
        onClick={() => openDialog('auth', { signup: false })}
        className="min-h-10 text-[13px] px-3.5 py-2 rounded-full border border-lime/40 bg-bg/55 whitespace-nowrap hover:bg-lime hover:text-[#081004] transition-colors max-sm:col-span-2 max-sm:w-fit"
      >
        Entrar ou criar conta <Icon name="arrow" className="w-4 h-4 inline" />
      </button>
    </section>
  );
}

function ProgramLists({
  rows: allRows,
  filter,
  scope,
}: {
  rows: Showtime[];
  filter: SessionFilterState;
  scope?: string | null;
}) {
  const logged = useAppStore((s) => s.logged());
  const cinemaSaved = useAppStore((s) => s.cinemaSaved);
  const profile = useAppStore((s) => s.profile());

  const rows = filterRows(allRows, filter);
  const groups = new Map<string, Showtime[]>();
  rows.forEach((s) => {
    if (!groups.has(s.theater)) groups.set(s.theater, []);
    groups.get(s.theater)!.push(s);
  });
  const favIds = [...groups.keys()].filter((id) => cinemaSaved(id));
  const restIds = [...groups.keys()].filter((id) => !cinemaSaved(id));

  return (
    <div>
      {logged ? (
        <section className="mb-6">
          <div className="flex items-center justify-between gap-2.5 mb-2.5">
            <h3 className="text-xl m-0">Cinemas favoritos</h3>
            {!scope && (
              <a
                className="text-xs text-[#dce3dc] hover:text-lime"
                href="/cinemas?favoritos=1"
              >
                Gerenciar favoritos →
              </a>
            )}
          </div>
          {favIds.length ? (
            favIds.map((cid) => (
              <CinemaSessionsBlock
                key={cid}
                cid={cid}
                rows={groups.get(cid)!}
                scope={scope}
              />
            ))
          ) : (
            <div className="border border-line rounded-app p-5 bg-surface text-muted">
              <p className="m-0 mb-2">
                {profile?.savedCinemas?.length
                  ? 'Nenhum dos seus cinemas favoritos tem sessões para esta seleção.'
                  : 'Use o coração na lista abaixo para colocar seus cinemas favoritos aqui.'}
              </p>
              {!scope && (
                <a
                  className="text-xs text-[#dce3dc] hover:text-lime"
                  href="/cinemas?favoritos=1"
                >
                  Favoritar cinemas →
                </a>
              )}
            </div>
          )}
        </section>
      ) : (
        <FavoriteDiscovery />
      )}
      <section>
        <h3 className="text-xl m-0 mb-2.5">
          {logged ? 'Demais cinemas' : 'Cinemas'}
        </h3>
        {restIds.length ? (
          restIds.map((cid) => (
            <CinemaSessionsBlock
              key={cid}
              cid={cid}
              rows={groups.get(cid)!}
              scope={scope}
            />
          ))
        ) : (
          <div className="border border-line rounded-app p-5 bg-surface text-muted">
            <p className="m-0">
              {rows.length
                ? 'Todos os cinemas desta seleção estão nos seus favoritos.'
                : 'Nenhuma sessão para os filtros selecionados.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function FilterGroup({
  rows: allRows,
  filter,
  onChange,
  filterKey,
  label,
}: {
  rows: Showtime[];
  filter: SessionFilterState;
  onChange: (key: keyof SessionFilterState, value: string) => void;
  filterKey: 'tech' | 'lang' | 'cinema';
  label: string;
}) {
  const options = filterGroupOptions(allRows, filter, filterKey);
  if (!options) return null;
  return (
    <div className="mb-5.5">
      <h4 className="text-[11px] tracking-[0.1em] uppercase text-[#a7b3a9] m-0 mb-2">
        {label}
      </h4>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={opt.disabled}
          aria-pressed={opt.active}
          onClick={() =>
            onChange(
              filterKey,
              filter[filterKey] === opt.value ? 'Todos' : opt.value
            )
          }
          className={`flex items-center justify-between gap-2.5 w-full text-left min-h-[41px] bg-[#0c110d] border border-line rounded-[11px] mb-1.5 px-3 py-2.5 text-[13px] text-[#cbd5cd] disabled:opacity-45 disabled:cursor-not-allowed ${
            opt.active ? 'bg-lime! text-[#081004]! border-lime! font-bold!' : ''
          }`}
        >
          <span>{opt.label}</span>
          <small className="opacity-75">{opt.count}</small>
        </button>
      ))}
    </div>
  );
}

export function MovieProgram({
  m,
  scope,
}: {
  m: Movie;
  scope?: string | null;
}) {
  const location = useAppStore((s) => s.location);
  const showtimes = useMovieShowtimesQuery(m.id);
  const [state, setFilter] = useState<SessionFilterState>(defaultFilmState);
  const [mobileOpen, setMobileOpen] = useState(false);
  // The API is nationwide: keep only the cinemas near the user
  const rows = useMemo(
    () =>
      (showtimes.data || []).filter((s) => {
        const c = cinema(s.theater);
        return !!c && inLocation(c, location);
      }),
    [showtimes.data, location]
  );
  const dates = useMemo(() => movieDates(rows), [rows]);
  // Until a date is picked (or if it's gone after a refetch), use the first
  const filter = dates.includes(state.date)
    ? state
    : { ...state, date: dates[0] || '' };

  const setFilterKey = (key: keyof SessionFilterState, value: string) =>
    setFilter({ ...filter, [key]: value });

  if (!rows.length) {
    return (
      <section id="sessoes" className="py-8 scroll-mt-[170px]">
        <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
          Programação
        </p>
        <h2 className="text-[32px] tracking-tight mb-5">Escolha sua sessão</h2>
        <div
          className="border border-lime/20 rounded-app p-6 bg-lime-soft"
          role={showtimes.isPending ? 'status' : undefined}
        >
          <p className="text-lg m-0 mb-3">
            {showtimes.isPending
              ? 'Carregando sessões…'
              : showtimes.isError
                ? 'Não foi possível carregar as sessões.'
                : `Ainda não há sessões em ${location.label} para esse filme.`}
          </p>
          {showtimes.isError && (
            <TextLink onClick={() => showtimes.refetch()}>
              Tentar novamente
            </TextLink>
          )}
          {showtimes.isSuccess && validDate(m.releaseDate) && (
            <div className="inline-flex items-center gap-3 px-3.5 py-2.5 border border-lime/30 bg-lime-soft rounded-[14px]">
              <small className="text-[#c3cfc1] text-[11px] uppercase tracking-[0.12em]">
                Estreia
              </small>
              <strong className="text-lime text-xl">
                {dateLabel(m.releaseDate, true)}
              </strong>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      id="sessoes"
      className="py-8 scroll-mt-[170px]"
      data-program-movie={m.id}
    >
      <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
        Programação
      </p>
      <h2 className="text-[32px] max-sm:text-[27px] tracking-tight mb-5">
        Escolha sua sessão
      </h2>
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        className="hidden max-sm:flex items-center justify-between px-3.5 py-2.5 border border-line rounded-xl w-full min-h-[42px] mb-3.5 bg-surface text-[13px]"
      >
        <span className="flex items-center gap-2">
          <Icon name="filter" className="w-[18px] h-[18px]" /> Filtros de sessão
        </span>
        <span>{mobileOpen ? '−' : '+'}</span>
      </button>
      <div className="grid grid-cols-[230px_1fr] max-sm:grid-cols-1 gap-8 max-sm:gap-3.5 items-start">
        <aside
          className={`border-r border-line pr-5 sticky top-[168px] min-w-0 max-sm:border-0 max-sm:pr-0 max-sm:static max-sm:border max-sm:border-line max-sm:rounded-2xl max-sm:p-4 ${
            mobileOpen ? 'max-sm:block' : 'max-sm:hidden'
          }`}
        >
          <h3 className="text-base mb-4.5 max-sm:hidden">Filtrar sessões</h3>
          <FilterGroup
            rows={rows}
            filter={filter}
            onChange={setFilterKey}
            filterKey="tech"
            label="Experiência"
          />
          <FilterGroup
            rows={rows}
            filter={filter}
            onChange={setFilterKey}
            filterKey="lang"
            label="Idioma"
          />
          <FilterGroup
            rows={rows}
            filter={filter}
            onChange={setFilterKey}
            filterKey="cinema"
            label="Cinema"
          />
          <TextLink
            onClick={() =>
              setFilter({
                ...filter,
                tech: 'Todos',
                lang: 'Todos',
                cinema: 'Todos',
              })
            }
          >
            Limpar filtros
          </TextLink>
        </aside>
        <div className="min-w-0">
          <Rail aria-label="Datas de sessão">
            {dates.map((d) => {
              const p = dateParts(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFilterKey('date', d)}
                  aria-pressed={filter.date === d}
                  aria-label={dateLabel(d, true)}
                  className={`shrink-0 flex-none w-[100px] min-h-[74px] border border-line rounded-2xl bg-[#0b100d] text-app-text text-left px-3.5 py-3 ${
                    filter.date === d
                      ? 'bg-lime! text-[#081004]! border-lime!'
                      : ''
                  }`}
                >
                  <b className="text-[17px] block">
                    {p.day} {p.month}
                  </b>
                  <span
                    className={`text-[11px] mt-0.5 block ${filter.date === d ? 'text-[#40502c]' : 'text-muted'}`}
                  >
                    {p.weekday}
                  </span>
                </button>
              );
            })}
          </Rail>
          <div className="mt-4">
            <ProgramLists rows={rows} filter={filter} scope={scope} />
          </div>
        </div>
      </div>
    </section>
  );
}
