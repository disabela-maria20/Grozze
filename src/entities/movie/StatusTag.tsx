'use client';

import type { Movie } from './types';
import { statusLabel } from './model';

/** The movie's status tag (see `statusLabel`); nothing when it has none. */
export function StatusTag({
  m,
  className,
}: {
  m: Movie | null | undefined;
  className?: string;
}) {
  const label = statusLabel(m);
  return label ? <div className={className}>{label}</div> : null;
}
