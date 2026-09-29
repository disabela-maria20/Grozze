'use client';

import type { ButtonHTMLAttributes } from 'react';
import { cx } from './cx';

export function TextLink({
  className = '',
  full,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { full?: boolean }) {
  return (
    <button
      className={cx(
        'border-0 bg-transparent p-0 py-1.5 text-[#dce3dc] text-sm inline-flex items-center gap-1.5 hover:text-lime transition-colors',
        full && 'w-full justify-center',
        className
      )}
      {...rest}
    />
  );
}
