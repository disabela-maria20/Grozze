'use client';

import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';
import { buttonStyles } from './buttonStyles';
import { cx } from './cx';

/**
 * A link styled as a button. Routes of the app ("/…") navigate client-side
 * with `next/link` (no page reload); anything else is a plain `<a>`.
 */
export function LinkButton({
  primary,
  small,
  full,
  className = '',
  href = '',
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  primary?: boolean;
  small?: boolean;
  full?: boolean;
}) {
  const classes = cx(
    buttonStyles.base,
    primary && buttonStyles.primary,
    small && buttonStyles.small,
    full && buttonStyles.full,
    className
  );
  const isAppRoute = href.startsWith('/') && !href.startsWith('//');

  if (isAppRoute && !rest.target) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} className={classes} {...rest}>
      {children}
    </a>
  );
}
