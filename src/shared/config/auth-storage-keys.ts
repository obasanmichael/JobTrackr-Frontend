/** Shared between HTTP client interceptors and auth session helpers. */
export const AUTH_STORAGE_KEYS = {
  accessToken: "jt_access_token",
  user: "jt_user",
} as const;
