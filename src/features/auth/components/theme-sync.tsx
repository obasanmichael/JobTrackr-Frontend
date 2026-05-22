"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/features/auth/hooks/use-auth";

/** Applies server-stored theme preference when it changes (login, save, hydrate). */
export function ThemeSync() {
  const { user, ready } = useAuth();
  const { setTheme } = useTheme();
  const syncedPreference = useRef<string | null>(null);

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      syncedPreference.current = null;
      return;
    }

    const serverTheme = user.themePreference ?? "system";
    if (syncedPreference.current === serverTheme) return;

    syncedPreference.current = serverTheme;
    setTheme(serverTheme);
  }, [ready, user?.themePreference, setTheme, user]);

  return null;
}
