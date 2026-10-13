'use client';

import type { Lead } from '@/shared/lib/types';
import { downloadFile } from './downloadFile';

/** Byte order mark, so Excel opens the file as UTF-8. */
const UTF8_BOM = '﻿';

const COLUMNS: (keyof Lead)[] = [
  'createdAt',
  'name',
  'email',
  'source',
  'marketingConsent',
  'scope',
];

/**
 * Quotes a CSV cell. Values starting with a formula character get a leading
 * apostrophe to prevent CSV injection in spreadsheet apps.
 */
function csvCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}

/** Downloads the leads as a semicolon-separated CSV (header row first). */
export function exportLeadsCsv(leads: Lead[]) {
  const rows = [
    COLUMNS,
    ...leads.map((lead) => COLUMNS.map((column) => lead[column])),
  ];
  downloadFile(
    'grozze-leads.csv',
    UTF8_BOM + rows.map((row) => row.map(csvCell).join(';')).join('\r\n'),
    'text/csv;charset=utf-8'
  );
}
