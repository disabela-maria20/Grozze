'use client';

import type { Movie } from './types';
import { useStatusLabel } from './useStatusLabel';

/** The movie's status tag (see `useStatusLabel`); nothing when it has none. */
export function StatusTag({
  m,
  className,
}: {
  m: Movie | null | undefined;
  className?: string;
}) {
  const label = useStatusLabel(m);
  return label ? <div className={className}>{label}</div> : null;
}
