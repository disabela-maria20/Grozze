/** Official colors of the Brazilian age ratings (ClassInd). */
const RATING_COLORS: Record<string, string> = {
  L: '#039749',
  '6': '#25a0aa',
  '10': '#057dbe',
  '12': '#efb600',
  '14': '#ea7921',
  '16': '#db2027',
  '18': '#191919',
};

/** Color for an unknown age rating number. */
const FALLBACK_COLOR = '#526256';

/** "Livre" / "L" → "L"; otherwise the first number in the text ("16 anos" → "16"). */
function ratingCode(rating: string | undefined): string | undefined {
  if (/livre|\bL\b/i.test(rating || '')) return 'L';
  return String(rating || '').match(/\d+/)?.[0];
}

export function ratingColor(
  rating: string | undefined
): { code: string; color: string } | null {
  const code = ratingCode(rating);
  if (!code) return null;
  return { code, color: RATING_COLORS[code] || FALLBACK_COLOR };
}
