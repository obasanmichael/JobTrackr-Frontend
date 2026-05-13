"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api";
import { saveSession, clearSession, getStoredUser, isAuthenticated } from "@/lib/auth";
import type { User, LoginPayload, RegisterPayload } from "@/types";

// Mock user for UI development — replaced with real auth when backend is live.
const DEV_USER: User = {
  id: "dev",
  name: "Alex Johnson",
  email: "alex@example.com",
  createdAt: new Date().toISOString(),
};

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(DEV_USER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored ?? DEV_USER);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload): Promise<void> => {
      // TODO: replace with real API call when backend is live
      // const { data } = await api.post<{ accessToken: string; user: User }>("/auth/login", payload);
      const mockUser: User = { ...DEV_USER, email: payload.email };
      saveSession({ accessToken: "dev-token" }, mockUser);
      setUser(mockUser);
      router.push("/dashboard");
    },
    [router]
  );

  const register = useCallback(
    async (payload: Omit<RegisterPayload, "confirmPassword">): Promise<void> => {
      // TODO: replace with real API call when backend is live
      // const { data } = await api.post<{ accessToken: string; user: User }>("/auth/register", payload);
      const mockUser: User = { ...DEV_USER, name: payload.name, email: payload.email };
      saveSession({ accessToken: "dev-token" }, mockUser);
      setUser(mockUser);
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
