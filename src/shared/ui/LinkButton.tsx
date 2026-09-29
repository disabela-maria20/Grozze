'use client';

import type { AnchorHTMLAttributes } from 'react';
import { buttonStyles } from './buttonStyles';
import { cx } from './cx';

export function LinkButton({
  primary,
  small,
  full,
  className = '',
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  primary?: boolean;
  small?: boolean;
  full?: boolean;
}) {
  return (
    <a
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
    </a>
  );
}
