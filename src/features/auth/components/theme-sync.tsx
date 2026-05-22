"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/features/auth/hooks/use-auth";

/** Applies server-stored theme preference after auth hydrates. */
export function ThemeSync() {
  const { user, ready } = useAuth();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!ready || !user) return;
    setTheme(user.themePreference ?? "system");
  }, [ready, user?.themePreference, setTheme, user]);

  return null;
}
