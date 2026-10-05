/** Lowercases and strips accents (combining diacritics), for comparisons. */
export const normalize = (value: unknown): string =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
