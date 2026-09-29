'use client';

import type { ButtonHTMLAttributes } from 'react';
import { buttonStyles } from './buttonStyles';
import { cx } from './cx';

export function Button({
  primary,
  small,
  full,
  className = '',
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean;
  small?: boolean;
  full?: boolean;
}) {
  return (
    <button
      className={cx(
        buttonStyles.base,
        primary && buttonStyles.primary,
        small && buttonStyles.small,
        full && buttonStyles.full,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
