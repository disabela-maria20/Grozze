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
import { FilmLoader, HeartButton, Icon, Rail, TextLink } from '@/shared/ui';

type FilterChangeHandler = (
  key: keyof SessionFilterState,
  value: string
) => void;

type ShowtimesQuery = ReturnType<typeof useMovieShowtimesQuery>;

/** Value that means "no restriction" for a filter group. */
const ALL_OPTION = 'Todos';

/** Sidebar filter groups, rendered in this order. */
const FILTER_GROUPS: {
  filterKey: 'tech' | 'lang' | 'cinema';
  label: string;
}[] = [
  { filterKey: 'tech', label: 'Experiência' },
  { filterKey: 'lang', label: 'Idioma' },
  { filterKey: 'cinema', label: 'Cinema' },
];

/** Groups showtimes by theater id, preserving the order of first appearance. */
function groupByTheater(showtimes: Showtime[]) {
  const groups = new Map<string, Showtime[]>();
  showtimes.forEach((showtime) => {
    if (!groups.has(showtime.theater)) groups.set(showtime.theater, []);
    groups.get(showtime.theater)!.push(showtime);
  });
  return groups;
}

function HourButtons({ rows }: { rows: Showtime[] }) {
  const openDialog = useAppStore((s) => s.openDialog);
  return (
    <div className="flex flex-wrap gap-2">
      {rows.map((showtime) => (
        <button
          key={showtime.id}
          type="button"
          className="min-w-[78px] h-[47px] inline-flex items-center justify-center border border-lime/25 rounded-xl bg-[#0c140d] text-white text-[15px] font-bold hover:bg-lime hover:text-[#081004] transition-colors"
          aria-label={`${showtime.time} · ${dateLabel(showtime.date)} · ${showtime.room} · ${showtime.tech} · ${showtime.lang}`}
          onClick={() => openDialog('session', { sessionId: showtime.id })}
        >
          {showtime.time}
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
      {groupedRooms(rows, preferences).map((roomRows) => {
        // Every showtime in a group shares room, tech and language
        const { room, tech, lang } = roomRows[0];
        return (
          <div key={room + tech + lang} className="mt-4.5 first:mt-0">
            <div className="flex items-baseline gap-2.5 flex-wrap mb-2.5 leading-tight">
              <strong className="text-xs tracking-wide text-lime">
                {room}
              </strong>
              <span className="text-[13px] text-muted">
                {tech} · {lang}
              </span>
            </div>
            <HourButtons rows={roomRows} />
          </div>
        );
      })}
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
  const theater = cinema(cid);
  return (
    <article className="py-5.5 first:pt-2.5 border-t border-line first:border-0">
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <h3 className="text-[23px] leading-[1.15] -tracking-[0.03em] m-0 mb-1.5">
            {theater?.name || 'Cinema'}
          </h3>
          <p className="text-[13px] text-muted m-0 break-words">
            {theater?.address || ''}
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

/** Renders one `CinemaSessionsBlock` per cinema id. */
function CinemaSessionsList({
  cinemaIds,
  groups,
  scope,
}: {
  cinemaIds: string[];
  groups: Map<string, Showtime[]>;
  scope?: string | null;
}) {
  return (
    <>
      {cinemaIds.map((cinemaId) => (
        <CinemaSessionsBlock
          key={cinemaId}
          cid={cinemaId}
          rows={groups.get(cinemaId)!}
          scope={scope}
        />
      ))}
    </>
  );
}

/** Invitation shown to anonymous users in place of the favorites section. */
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

function FavoriteCinemasSection({
  favoriteIds,
  groups,
  hasSavedCinemas,
  scope,
}: {
  favoriteIds: string[];
  groups: Map<string, Showtime[]>;
  hasSavedCinemas: boolean;
  scope?: string | null;
}) {
  const emptyMessage = hasSavedCinemas
    ? 'Nenhum dos seus cinemas favoritos tem sessões para esta seleção.'
    : 'Use o coração na lista abaixo para colocar seus cinemas favoritos aqui.';

  return (
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
      {favoriteIds.length ? (
        <CinemaSessionsList
          cinemaIds={favoriteIds}
          groups={groups}
          scope={scope}
        />
      ) : (
        <div className="border border-line rounded-app p-5 bg-surface text-muted">
          <p className="m-0 mb-2">{emptyMessage}</p>
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
  );
}

/**
 * Lists the filtered sessions grouped by cinema: favorite cinemas first
 * (or a sign-in invitation for anonymous users), then the remaining ones.
 */
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
  const groups = groupByTheater(rows);
  const cinemaIds = [...groups.keys()];
  const favoriteIds = cinemaIds.filter((id) => cinemaSaved(id));
  const otherIds = cinemaIds.filter((id) => !cinemaSaved(id));

  const otherCinemasEmptyMessage = rows.length
    ? 'Todos os cinemas desta seleção estão nos seus favoritos.'
    : 'Nenhuma sessão para os filtros selecionados.';

  return (
    <div>
      {logged ? (
        <FavoriteCinemasSection
          favoriteIds={favoriteIds}
          groups={groups}
          hasSavedCinemas={!!profile?.savedCinemas?.length}
          scope={scope}
        />
      ) : (
        <FavoriteDiscovery />
      )}
      <section>
        <h3 className="text-xl m-0 mb-2.5">
          {logged ? 'Demais cinemas' : 'Cinemas'}
        </h3>
        {otherIds.length ? (
          <CinemaSessionsList
            cinemaIds={otherIds}
            groups={groups}
            scope={scope}
          />
        ) : (
          <div className="border border-line rounded-app p-5 bg-surface text-muted">
            <p className="m-0">{otherCinemasEmptyMessage}</p>
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
  onChange: FilterChangeHandler;
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
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={option.disabled}
          aria-pressed={option.active}
          // Clicking the selected option again clears the group
          onClick={() =>
            onChange(
              filterKey,
              filter[filterKey] === option.value ? ALL_OPTION : option.value
            )
          }
          className={`flex items-center justify-between gap-2.5 w-full text-left min-h-[41px] bg-[#0c110d] border border-line rounded-[11px] mb-1.5 px-3 py-2.5 text-[13px] text-[#cbd5cd] disabled:opacity-45 disabled:cursor-not-allowed ${
            option.active
              ? 'bg-lime! text-[#081004]! border-lime! font-bold!'
              : ''
          }`}
        >
          <span>{option.label}</span>
          <small className="opacity-75">{option.count}</small>
        </button>
      ))}
    </div>
  );
}

function ProgramEyebrow() {
  return (
    <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
      Programação
    </p>
  );
}

function ReleaseDateBadge({ releaseDate }: { releaseDate: string }) {
  return (
    <div className="inline-flex items-center gap-3 px-3.5 py-2.5 border border-lime/30 bg-lime-soft rounded-[14px]">
      <small className="text-[#c3cfc1] text-[11px] uppercase tracking-[0.12em]">
        Estreia
      </small>
      <strong className="text-lime text-xl">
        {dateLabel(releaseDate, true)}
      </strong>
    </div>
  );
}

/** Shown while sessions load, when loading fails, or when there are none. */
function EmptyProgram({
  movie,
  showtimes,
  locationLabel,
}: {
  movie: Movie;
  showtimes: ShowtimesQuery;
  locationLabel: string;
}) {
  const message = showtimes.isError
    ? 'Não foi possível carregar as sessões.'
    : `Ainda não há sessões em ${locationLabel} para esse filme.`;

  return (
    <section id="sessoes" className="py-8 scroll-mt-[170px]">
      <ProgramEyebrow />
      <h2 className="text-[32px] tracking-tight mb-5">Escolha sua sessão</h2>
      <div className="border border-lime/20 rounded-app p-6 bg-lime-soft">
        {showtimes.isPending ? (
          <FilmLoader label={`Buscando sessões em ${locationLabel}…`} />
        ) : (
          <p className="text-lg m-0 mb-3">{message}</p>
        )}
        {showtimes.isError && (
          <TextLink onClick={() => showtimes.refetch()}>
            Tentar novamente
          </TextLink>
        )}
        {showtimes.isSuccess && validDate(movie.releaseDate) && (
          <ReleaseDateBadge releaseDate={movie.releaseDate} />
        )}
      </div>
    </section>
  );
}

/** Mobile-only button that shows/hides the filters sidebar. */
function MobileFiltersToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="hidden max-sm:flex items-center justify-between px-3.5 py-2.5 border border-line rounded-xl w-full min-h-[42px] mb-3.5 bg-surface text-[13px]"
    >
      <span className="flex items-center gap-2">
        <Icon name="filter" className="w-[18px] h-[18px]" /> Filtros de sessão
      </span>
      <span>{open ? '−' : '+'}</span>
    </button>
  );
}

function FiltersSidebar({
  rows,
  filter,
  mobileOpen,
  onChange,
  onClear,
}: {
  rows: Showtime[];
  filter: SessionFilterState;
  mobileOpen: boolean;
  onChange: FilterChangeHandler;
  onClear: () => void;
}) {
  return (
    <aside
      className={`border-r border-line pr-5 sticky top-[168px] min-w-0 max-sm:border-0 max-sm:pr-0 max-sm:static max-sm:border max-sm:border-line max-sm:rounded-2xl max-sm:p-4 ${
        mobileOpen ? 'max-sm:block' : 'max-sm:hidden'
      }`}
    >
      <h3 className="text-base mb-4.5 max-sm:hidden">Filtrar sessões</h3>
      {FILTER_GROUPS.map(({ filterKey, label }) => (
        <FilterGroup
          key={filterKey}
          rows={rows}
          filter={filter}
          onChange={onChange}
          filterKey={filterKey}
          label={label}
        />
      ))}
      <TextLink onClick={onClear}>Limpar filtros</TextLink>
    </aside>
  );
}

function DateButton({
  date,
  selected,
  onSelect,
}: {
  date: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const { day, month, weekday } = dateParts(date);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={dateLabel(date, true)}
      className={`shrink-0 flex-none w-[100px] min-h-[74px] border border-line rounded-2xl bg-[#0b100d] text-app-text text-left px-3.5 py-3 ${
        selected ? 'bg-lime! text-[#081004]! border-lime!' : ''
      }`}
    >
      <b className="text-[17px] block">
        {day} {month}
      </b>
      <span
        className={`text-[11px] mt-0.5 block ${selected ? 'text-[#40502c]' : 'text-muted'}`}
      >
        {weekday}
      </span>
    </button>
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
      (showtimes.data || []).filter((showtime) => {
        const theater = cinema(showtime.theater);
        return !!theater && inLocation(theater, location);
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

  const clearFilters = () =>
    setFilter({
      ...filter,
      tech: ALL_OPTION,
      lang: ALL_OPTION,
      cinema: ALL_OPTION,
    });

  if (!rows.length) {
    return (
      <EmptyProgram
        movie={m}
        showtimes={showtimes}
        locationLabel={location.label}
      />
    );
  }

  return (
    <section
      id="sessoes"
      className="py-8 scroll-mt-[170px]"
      data-program-movie={m.id}
    >
      <ProgramEyebrow />
      <h2 className="text-[32px] max-sm:text-[27px] tracking-tight mb-5">
        Escolha sua sessão
      </h2>
      <MobileFiltersToggle
        open={mobileOpen}
        onToggle={() => setMobileOpen((open) => !open)}
      />
      <div className="grid grid-cols-[230px_1fr] max-sm:grid-cols-1 gap-8 max-sm:gap-3.5 items-start">
        <FiltersSidebar
          rows={rows}
          filter={filter}
          mobileOpen={mobileOpen}
          onChange={setFilterKey}
          onClear={clearFilters}
        />
        <div className="min-w-0">
          <Rail aria-label="Datas de sessão">
            {dates.map((date) => (
              <DateButton
                key={date}
                date={date}
                selected={filter.date === date}
                onSelect={() => setFilterKey('date', date)}
              />
            ))}
          </Rail>
          <div className="mt-4">
            <ProgramLists rows={rows} filter={filter} scope={scope} />
          </div>
        </div>
      </div>
    </section>
  );
}
