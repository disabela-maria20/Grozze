import type { Cinema } from '../types';

/** Active cinemas loaded from the catalog API. Filled by `setCatalog`. */
export const baseCinemas = new Map<string, Cinema>();
