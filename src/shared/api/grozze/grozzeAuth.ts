import {
  GrozzeApiError,
  grozzeRequest,
  type GrozzeRequestOptions,
} from './grozzeGet';
import type {
  GrozzeAuthResponse,
  GrozzeFavoriteKind,
  GrozzeFavorites,
  GrozzeSession,
  GrozzeSignupRequest,
  GrozzeUpdateMeRequest,
  GrozzeUser,
} from './grozzeTypes';

/**
 * The access token lives only in memory: a page reload loses it on purpose,
 * and `refresh()` gets a new one from the httpOnly refresh cookie. Keeping
 * it out of localStorage means an XSS can't read a long-lived credential.
 */
let accessToken: string | null = null;

/** Called when the session can no longer be renewed (expired or revoked). */
let onSessionLost: () => void = () => {};

export function setSessionLostHandler(handler: () => void) {
  onSessionLost = handler;
}

/**
 * Set once this browser is known to have no session (refresh refused or
 * logout), so page loads skip `/auth/refresh` until the next login. Unset
 * means unknown: the first visit still asks once. Not a credential, so it
 * can live in localStorage.
 */
const NO_SESSION_KEY = 'grozze.no-session';

function rememberNoSession(none: boolean) {
  try {
    if (none) localStorage.setItem(NO_SESSION_KEY, '1');
    else localStorage.removeItem(NO_SESSION_KEY);
  } catch {
    /* SSR or storage disabled: every load just asks the API */
  }
}

function knownLoggedOut(): boolean {
  try {
    return localStorage.getItem(NO_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

async function withNewToken(
  request: Promise<GrozzeAuthResponse>
): Promise<GrozzeUser> {
  const { accessToken: token, user } = await request;
  accessToken = token;
  rememberNoSession(false);
  return user;
}

const RESTORE_RETRY_DELAY_MS = 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** In-flight refresh, shared so parallel 401s renew the session only once. */
let refreshing: Promise<GrozzeUser> | null = null;

/** Renews the session from the refresh cookie; rejects when there is none. */
function refresh(): Promise<GrozzeUser> {
  refreshing ??= withNewToken(
    grozzeRequest<GrozzeAuthResponse>('/auth/refresh', { method: 'POST' })
  )
    .catch((err) => {
      accessToken = null;
      throw err;
    })
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

/**
 * Request that needs login. An expired access token (401) is renewed once and
 * the request retried; if renewing fails, the session is over.
 */
export async function authorized<T>(
  path: string,
  options: Omit<GrozzeRequestOptions, 'accessToken'> = {}
): Promise<T> {
  try {
    return await grozzeRequest<T>(path, { ...options, accessToken });
  } catch (err) {
    if (!(err instanceof GrozzeApiError) || err.status !== 401) throw err;
  }
  try {
    await refresh();
  } catch (err) {
    onSessionLost();
    throw err;
  }
  return grozzeRequest<T>(path, { ...options, accessToken });
}

export const grozzeAuth = {
  signup: (body: GrozzeSignupRequest) =>
    withNewToken(
      grozzeRequest<GrozzeAuthResponse>('/auth/signup', {
        method: 'POST',
        body,
      })
    ),

  login: (email: string, password: string) =>
    withNewToken(
      grozzeRequest<GrozzeAuthResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      })
    ),

  /**
   * Restores the session on page load: the user, or `null` when there is no
   * session (without calling the API once this browser is known to be
   * logged out). Rejects when the API can't be reached.
   */
  async restore(): Promise<GrozzeUser | null> {
    if (knownLoggedOut()) return null;
    for (let attempt = 1; ; attempt++) {
      try {
        return await refresh();
      } catch (err) {
        if (!(err instanceof GrozzeApiError) || err.status !== 401) throw err;
        // A 401 may be another tab renewing the same session; its new
        // cookie lands by the second try. Two refusals: really logged out.
        if (attempt === 2) {
          rememberNoSession(true);
          return null;
        }
      }
      await wait(RESTORE_RETRY_DELAY_MS);
    }
  },

  /** Ends this session. Never fails: locally the user is out either way. */
  async logout() {
    accessToken = null;
    rememberNoSession(true);
    await grozzeRequest<null>('/auth/logout', { method: 'POST' }).catch(
      () => null
    );
  },

  /** Always resolves with the same message, whether the e-mail has an account or not. */
  forgotPassword: (email: string) =>
    grozzeRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    }),

  /** Which account a reset link is for; rejects when it's invalid, used or expired. */
  verifyResetToken: (token: string) =>
    grozzeRequest<{ email: string }>('/auth/reset-password/verify', {
      method: 'POST',
      body: { token },
    }),

  resetPassword: (token: string, password: string) =>
    grozzeRequest<null>('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    }),

  /** Other devices are logged out; this one stays. */
  changePassword: (currentPassword: string, newPassword: string) =>
    authorized<null>('/auth/change-password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    }),

  sessions: () => authorized<GrozzeSession[]>('/auth/sessions'),

  revokeSession: (id: string) =>
    authorized<null>(`/auth/sessions/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  revokeOtherSessions: () =>
    authorized<null>('/auth/sessions', { method: 'DELETE' }),

  me: () => authorized<GrozzeUser>('/me'),

  updateMe: (body: GrozzeUpdateMeRequest) =>
    authorized<GrozzeUser>('/me', { method: 'PATCH', body }),

  /** Saves (`true`) or removes a favorite; resolves with the updated lists. */
  setFavorite: (kind: GrozzeFavoriteKind, id: string, saved: boolean) =>
    authorized<GrozzeFavorites>(
      `/me/favorites/${kind}s/${encodeURIComponent(id)}`,
      { method: saved ? 'PUT' : 'DELETE' }
    ),

  /** Adds many at once (favorites saved in this browser before the account). */
  mergeFavorites: (favorites: GrozzeFavorites) =>
    authorized<GrozzeFavorites>('/me/favorites', {
      method: 'POST',
      body: favorites,
    }),
};
