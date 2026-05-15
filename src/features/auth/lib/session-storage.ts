import type { User } from "@/types";
import { AUTH_STORAGE_KEYS } from "@/shared/config/auth-storage-keys";

export function saveSession(accessToken: string, user: User): void {
  localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, accessToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.user, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.user);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function hasStoredSession(): boolean {
  return Boolean(getAccessToken());
}
