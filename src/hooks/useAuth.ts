"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api";
import { saveSession, clearSession, getStoredUser, isAuthenticated } from "@/lib/auth";
import type { User, LoginPayload, RegisterPayload } from "@/types";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload): Promise<void> => {
      const { data } = await api.post<{ accessToken: string; user: User }>(
        "/auth/login",
        payload
      );
      saveSession({ accessToken: data.accessToken }, data.user);
      setUser(data.user);
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (payload: Omit<RegisterPayload, "confirmPassword">): Promise<void> => {
      const { data } = await api.post<{ accessToken: string; user: User }>(
        "/auth/register",
        payload
      );
      saveSession({ accessToken: data.accessToken }, data.user);
      setUser(data.user);
      router.push("/dashboard");
    },
    [router]
  );

  const logout = useCallback((): void => {
    clearSession();
    setUser(null);
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async (): Promise<void> => {
    if (!isAuthenticated()) return;
    try {
      const { data } = await api.get<User>("/auth/me");
      setUser(data);
      localStorage.setItem("jt_user", JSON.stringify(data));
    } catch {
      // silently fail — interceptor handles 401
    }
  }, []);

  return { user, loading, isAuthenticated: Boolean(user), login, register, logout, refreshUser, getApiErrorMessage };
}
