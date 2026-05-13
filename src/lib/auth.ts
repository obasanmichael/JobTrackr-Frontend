import type { User, AuthTokens } from "@/types";

const TOKEN_KEY = "jt_access_token";
const USER_KEY = "jt_user";

export function saveSession(tokens: AuthTokens, user: User): void {
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
