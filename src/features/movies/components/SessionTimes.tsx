'use client';

import type { Showtime } from '@/entities/movie';
import { dateLabel, dateParts, nowInSaoPaulo } from '@/shared/lib/date';
import { useAppStore } from '@/shared/store';
import { groupedRooms } from '../lib';

/** Sessions that haven't started yet (São Paulo time), the only bookable ones. */
export function openShowtimes(showtimes: Showtime[] | undefined): Showtime[] {
  const now = nowInSaoPaulo();
  const nowTime = `${now.hour}:${now.minute}`;
  return (showtimes || []).filter(
    (showtime) =>
      showtime.date > now.date ||
      (showtime.date === now.date && showtime.time >= nowTime)
  );
}

/** Session times; each opens the session dialog (same session id end to end). */
export function HourButtons({ rows }: { rows: Showtime[] }) {
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

/** Sessions grouped by room + format + language (preferred ones first). */
export function RoomBlocks({
  rows,
  preferences,
  boxed = false,
}: {
  rows: Showtime[];
  preferences?: { language?: string; format?: string };
  /** Each room in its own bordered box (cinema page). */
  boxed?: boolean;
}) {
  return (
    <>
      {groupedRooms(rows, preferences).map((roomRows) => {
        // Every showtime in a group shares room, tech and language
        const { room, tech, lang } = roomRows[0];
        return (
          <div
            key={room + tech + lang}
            className={
              boxed
                ? 'mt-3.5 p-3.5 max-sm:mt-3 max-sm:py-2.75 max-sm:px-2.5 border border-line rounded-[13px] max-sm:rounded-xl bg-white/[0.015]'
                : 'mt-4.5 first:mt-0'
            }
          >
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

/** One day of the dates rail. */
export function DateButton({
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
