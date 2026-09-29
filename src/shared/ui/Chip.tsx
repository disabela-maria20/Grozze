'use client';

import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx';

export function Chip({
  active,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cx(
        'border border-line bg-surface2 text-[#cbd5cd] rounded-full px-3.5 py-2 min-h-10 text-[13px] inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0',
        active && 'text-[#081004]! bg-lime! border-lime! font-bold!',
        className
      )}
      {...rest}
    />
  );
}
