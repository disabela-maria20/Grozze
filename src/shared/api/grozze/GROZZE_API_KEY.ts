/**
 * Client key sent as `x-api-key`. It ships to the browser (visible in
 * DevTools): it identifies the client and limits abuse, it doesn't protect
 * user data. Empty when not configured; the lists then use local fallbacks.
 */
export const GROZZE_API_KEY = process.env.NEXT_PUBLIC_GROZZE_API_KEY || '';
