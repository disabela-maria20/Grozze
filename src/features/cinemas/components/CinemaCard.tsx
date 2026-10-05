'use client';

import Link from 'next/link';
import { useAppStore } from '@/shared/store';
import { distanceKm } from '@/shared/lib/catalog';
import type { Cinema } from '@/shared/lib/types';
import { HeartButton } from '@/shared/ui';

function roomCountLabel(roomCount: number) {
  return `${roomCount} ${roomCount === 1 ? 'sala' : 'salas'}`;
}

/** Formats e.g. 2.345 as "2,3 km em linha reta · ". */
function distanceLabel(km: number) {
  return `${km.toFixed(1).replace('.', ',')} km em linha reta · `;
}

export function CinemaCard({ c }: { c: Cinema }) {
  const saved = useAppStore((s) => s.cinemaSaved(c.id));
  const location = useAppStore((s) => s.location);
  const km = distanceKm(c, location.coords);
  const details = [
    c.city && `${c.city}, ${c.uf}`,
    c.roomCount && roomCountLabel(c.roomCount),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      className={`cinema-card grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center border rounded-[17px] p-5 min-w-0 max-sm:p-4 max-sm:rounded-2xl ${
        saved
          ? 'border-lime/30 bg-gradient-to-[120deg] from-lime-soft to-surface'
          : 'border-line bg-surface'
      }`}
    >
      <div>
        <Link href={`/cinema/${c.id}`}>
          <h2 className="text-xl max-sm:text-lg leading-[1.25] -tracking-[0.025em] m-0 mb-1.5">
            {c.name}
          </h2>
          <p className="text-muted text-[13px] max-sm:text-xs m-0 mb-1.5">
            {c.address}
          </p>
        </Link>
        <small className="text-faint text-xs">
          {km !== null ? distanceLabel(km) : ''}
          {details}
        </small>
      </div>
      <HeartButton kind="cinema" id={c.id} path={`/cinema/${c.id}`} />
    </article>
  );
}
