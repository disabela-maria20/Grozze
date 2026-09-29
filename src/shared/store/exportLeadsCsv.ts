'use client';

import type { Lead } from '@/shared/lib/types';
import { downloadFile } from './downloadFile';

export function exportLeadsCsv(leads: Lead[]) {
  const cell = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const cols: (keyof Lead)[] = [
    'createdAt',
    'name',
    'email',
    'source',
    'marketingConsent',
    'scope',
  ];
  downloadFile(
    'grozze-leads-homologacao.csv',
    '﻿' +
      [cols, ...leads.map((l) => cols.map((c) => l[c]))]
        .map((r) => r.map(cell).join(';'))
        .join('\r\n'),
    'text/csv;charset=utf-8'
  );
}
