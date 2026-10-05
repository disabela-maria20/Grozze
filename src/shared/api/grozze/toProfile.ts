import type { Profile } from '@/shared/lib/types';
import type { GrozzeUser } from './grozzeTypes';

/** Grozze API avatar name → key the UI uses for the icon. */
export const AVATAR_KEY_BY_NAME: Record<string, Profile['avatar']> = {
  Inicial: 'initial',
  Estrela: 'star',
  Lua: 'moon',
  Sol: 'sun',
};

/**
 * API user → the `Profile` the screens already use. Choices are kept by
 * display name ("Dublado", "IMAX"), with "Todos" for no preference.
 */
export function toProfile(user: GrozzeUser): Profile {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    savedMovies: user.favorites.movies,
    savedCinemas: user.favorites.cinemas,
    avatar: AVATAR_KEY_BY_NAME[user.avatar?.nome ?? ''] ?? 'initial',
    preferences: {
      language: user.language?.nome ?? 'Todos',
      format: user.experience?.nome ?? 'Todos',
      genres: user.genres.map((genre) => genre.nome),
    },
  };
}
