export function ratingColor(
  r: string | undefined
): { code: string; color: string } | null {
  const x = /livre|\bL\b/i.test(r || '')
    ? 'L'
    : String(r || '').match(/\d+/)?.[0];
  if (!x) return null;
  const colors: Record<string, string> = {
    L: '#039749',
    '6': '#25a0aa',
    '10': '#057dbe',
    '12': '#efb600',
    '14': '#ea7921',
    '16': '#db2027',
    '18': '#191919',
  };
  return { code: x, color: colors[x] || '#526256' };
}
