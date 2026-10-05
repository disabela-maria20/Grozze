import { grozzeGet } from './grozzeGet';
import type { GrozzeItem, GrozzeLanguage } from './grozzeTypes';

/** Signup support lists, each sorted by id. */
export const grozzeApi = {
  /** `GET /api/avatars` — "Estrela", "Inicial", "Lua", "Sol". */
  avatars: () => grozzeGet<GrozzeItem[]>('/avatars'),
  /** `GET /api/experiences` — room types, starting with "Todos". */
  experiences: () => grozzeGet<GrozzeItem[]>('/experiences'),
  /** `GET /api/languages` — "Legendado", "Dublado", "Nacional". */
  languages: () => grozzeGet<GrozzeLanguage[]>('/languages'),
  /** `GET /api/movie/genres`. */
  movieGenres: () => grozzeGet<GrozzeItem[]>('/movie/genres'),
};
