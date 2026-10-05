/**
 * For mutations that receive a password. React Query keeps a finished
 * mutation (and its `variables`, the password included) in memory for five
 * minutes by default; `gcTime: 0` drops it as soon as no component uses it.
 */
export const SENSITIVE_MUTATION = { gcTime: 0 } as const;
