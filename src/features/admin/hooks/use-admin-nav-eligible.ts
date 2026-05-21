"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { probeAdminAccess } from "@/features/admin/lib/admin-access";
import { isAdminUser } from "@/shared/config/admin";

const STALE = 5 * 60 * 1000;

/**
 * Whether to show admin navigation. Uses `NEXT_PUBLIC_ADMIN_USER_IDS` and/or
 * a lightweight `/admin/users` probe (supports DB-backed admins without env).
 */
export function useAdminNavEligible(): { showAdminNav: boolean; isProbing: boolean } {
  const { user, ready } = useAuth();
  const q = useQuery({
    queryKey: ["admin", "nav-eligible", user?.id],
    queryFn: probeAdminAccess,
    enabled: ready && Boolean(user) && !isAdminUser(user?.id),
    staleTime: STALE,
  });

  const envAdmin = isAdminUser(user?.id);
  const probeAllows = q.data === true;

  return {
    showAdminNav: envAdmin || probeAllows,
    isProbing: Boolean(user) && !envAdmin && q.isPending,
  };
}
