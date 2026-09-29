'use client';

import { useMemo } from 'react';
import { cinema } from '@/shared/lib/catalog/cinema';
import { dateLabel } from '@/shared/lib/catalog/dateLabel';
import { groupedRooms } from '@/shared/lib/catalog/groupedRooms';
import { movie } from '@/shared/lib/catalog/movie';
import { SESSIONS } from '@/shared/lib/catalog/SESSIONS';
import { useAppStore } from '@/shared/store/useAppStore';
import { MoviePoster } from '@/features/movies';
import { LinkButton } from '@/shared/ui/LinkButton';

export function NowDialog() {
  const content = useAppStore((s) => s.content);
  const closeDialog = useAppStore((s) => s.closeDialog);

  const { today, hourLabel, groups } = useMemo(() => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const p = Object.fromEntries(parts.map((x) => [x.type, x.value])) as Record<
      string,
      string
    >;
    const today = `${p.year}-${p.month}-${p.day}`;
    const mins = Number(p.hour) * 60 + Number(p.minute);
    const list = SESSIONS.filter((s) => {
      if (s.date !== today) return false;
      const t = Number(s.time.slice(0, 2)) * 60 + Number(s.time.slice(3));
      return t >= mins && t < mins + 60;
    });
    const groupMap = new Map<string, typeof list>();
    for (const s of list) {
      const k = s.movie + '|' + s.theater;
      if (!groupMap.has(k)) groupMap.set(k, []);
      groupMap.get(k)!.push(s);
    }
    return {
      today,
      hourLabel: `${p.hour}:${p.minute}`,
      groups: [...groupMap.values()],
    };
  }, []);

  return (
    <div>
      <p className="text-[11px] tracking-[0.17em] uppercase font-extrabold text-lime mb-2">
        Nos próximos 60 minutos
      </p>
      <h2 className="text-[34px] leading-[1.08] tracking-tight m-0 mb-3 pr-10">
        Começando agora
      </h2>
      <p className="text-sm text-muted leading-relaxed mb-5">
        Consulta à agenda de homologação · {dateLabel(today)} {hourLabel}. Os
        horários podem ser simulados.
      </p>
      {groups.length ? (
        <div className="grid gap-4">
          {groups.map((rows) => {
            const m = movie(rows[0].movie, content)!;
            const c = cinema(rows[0].theater)!;
            return (
              <article
                key={rows[0].movie + rows[0].theater}
                className="grid grid-cols-[83px_1fr] gap-5 border-t border-line pt-5 first:border-0 first:pt-0"
              >
                <MoviePoster m={m} className="w-[83px] rounded-[10px]" />
                <div>
                  <h3 className="text-[23px] tracking-tight m-0 mb-1">{m.t}</h3>
                  <p className="text-muted m-0 mb-2">{c.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {groupedRooms(rows)
                      .flat()
                      .map((s) => (
                        <span
                          key={s.id}
                          className="hour min-w-[78px] h-[47px] inline-flex items-center justify-center border border-lime/25 rounded-xl bg-[#0c140d] text-white text-[15px] font-bold"
                        >
                          {s.time}
                        </span>
                      ))}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="border border-line rounded-app p-5 bg-surface text-muted">
          <p>Não há sessões nesta janela na agenda carregada.</p>
          <LinkButton href="/filmes" onClick={() => closeDialog()}>
            Explorar filmes
          </LinkButton>
        </div>
      )}
    </div>
  );
}
