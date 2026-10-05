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

async function withNewToken(
  request: Promise<GrozzeAuthResponse>
): Promise<GrozzeUser> {
  const { accessToken: token, user } = await request;
  accessToken = token;
  return user;
}

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
async function authorized<T>(
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

  /** Restores the session on page load (rejects if not logged in). */
  restore: refresh,

  /** Ends this session. Never fails: locally the user is out either way. */
  async logout() {
    accessToken = null;
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
