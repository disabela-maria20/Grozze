'use client';

import type { ReactNode } from 'react';
import { FieldError } from './FieldError';

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 mb-4 min-w-0">
      <span className="text-[#b4c0b6] text-[13px]">{label}</span>
      {children}
      <FieldError message={error} />
    </label>
  );
}
