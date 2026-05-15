"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { LoginPayload, User } from "@/types";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import {
  fetchCurrentUser,
  loginRequest,
  registerRequest,
} from "@/features/auth/api/auth-api";
import {
  clearSession,
  getAccessToken,
  getStoredUser,
  hasStoredSession,
  saveSession,
} from "@/features/auth/lib/session-storage";
import type { RegisterRequestBody } from "@/features/auth/types";

interface AuthContextValue {
  user: User | null;
  /** True until the client has read localStorage and optionally refreshed `/auth/me`. */
  ready: boolean;
  login: (payload: LoginPayload, redirectTo?: string) => Promise<void>;
  register: (payload: RegisterRequestBody, redirectTo?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getApiErrorMessage: typeof getApiErrorMessage;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const token = getAccessToken();
      const stored = getStoredUser();

      if (!token) {
        if (!cancelled) {
          setUser(null);
          setReady(true);
        }
        return;
      }

      if (stored) {
        setUser(stored);
      }

      try {
        const fresh = await fetchCurrentUser();
        if (!cancelled) {
          setUser(fresh);
          saveSession(token, fresh);
        }
      } catch {
        if (!cancelled) {
          clearSession();
          setUser(null);
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(
    async (payload: LoginPayload, redirectTo?: string) => {
      const { accessToken, user: nextUser } = await loginRequest(payload);
      saveSession(accessToken, nextUser);
      setUser(nextUser);
      const target =
        redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : "/dashboard";
      router.push(target);
    },
    [router]
  );

  const register = useCallback(
    async (payload: RegisterRequestBody, redirectTo?: string) => {
      const { accessToken, user: nextUser } = await registerRequest(payload);
      saveSession(accessToken, nextUser);
      setUser(nextUser);
      const target =
        redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : "/dashboard";
      router.push(target);
    },
    [router]
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!hasStoredSession()) return;
    try {
      const next = await fetchCurrentUser();
      const token = getAccessToken();
      if (token) saveSession(token, next);
      setUser(next);
    } catch {
      // 401 handled by HTTP client; session cleared
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      refreshUser,
      getApiErrorMessage,
    }),
    [user, ready, login, register, logout, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider.");
  }
  return ctx;
}
