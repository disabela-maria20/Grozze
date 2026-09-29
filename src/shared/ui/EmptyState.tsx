'use client';

import type { ReactNode } from 'react';
import { cx } from './cx';

export function EmptyState({
  title,
  children,
  className = '',
}: {
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        'border border-line rounded-app p-6 bg-surface text-muted text-[15px] leading-relaxed',
        className
      )}
    >
      {title && (
        <h3 className="text-app-text text-[23px] tracking-tight m-0 mb-2">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
