'use client';

import { cx } from './cx';

/**
 * Loading indicator for catalog requests: a spinning film reel feeding a
 * running film strip. Static under `prefers-reduced-motion` (globals.css).
 */
export function FilmLoader({
  label,
  compact = false,
  className = '',
}: {
  label: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cx(
        'flex items-center gap-4 text-muted',
        compact ? 'text-sm' : 'flex-col justify-center text-center py-6',
        className
      )}
    >
      <div className="flex items-center" aria-hidden>
        <svg
          viewBox="0 0 48 48"
          className={cx(
            'animate-reel-spin text-lime shrink-0',
            compact ? 'w-9 h-9' : 'w-16 h-16'
          )}
        >
          <circle
            cx="24"
            cy="24"
            r="21"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <circle cx="24" cy="24" r="3.5" fill="currentColor" />
          {[0, 72, 144, 216, 288].map((deg) => (
            <circle
              key={deg}
              cx="24"
              cy="12"
              r="5"
              fill="currentColor"
              opacity="0.85"
              transform={`rotate(${deg} 24 24)`}
            />
          ))}
        </svg>
        <span
          className={cx(
            'film-strip block rounded-[3px] -ml-1',
            compact ? 'w-16 h-4' : 'w-28 h-6'
          )}
        />
      </div>
      <p className={cx('m-0', compact ? '' : 'text-[15px]')}>{label}</p>
    </div>
  );
}
