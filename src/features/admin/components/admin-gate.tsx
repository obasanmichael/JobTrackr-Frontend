"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { probeAdminAccess } from "@/features/admin/lib/admin-access";
import { isAdminUser } from "@/shared/config/admin";

/**
 * Blocks `/admin/*` unless the user has admin APIs access (env allowlist or DB membership).
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const envOk = isAdminUser(user?.id);

  const q = useQuery({
    queryKey: ["admin", "nav-eligible", user?.id],
    queryFn: probeAdminAccess,
    enabled: ready && Boolean(user) && !envOk,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!ready || !user) {
      return;
    }
    if (envOk) {
      return;
    }
    if (q.isSuccess && q.data === false) {
      router.replace("/dashboard");
    }
  }, [ready, user, envOk, q.isSuccess, q.data, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center bg-background">
        <Loader2
          className="h-8 w-8 animate-spin text-muted-foreground"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (envOk) {
    return <>{children}</>;
  }

  if (q.isPending) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center bg-background">
        <Loader2
          className="h-8 w-8 animate-spin text-muted-foreground"
          aria-label="Checking admin access"
        />
      </div>
    );
  }

  if (q.isError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-muted-foreground">
        Could not verify admin access. Check your connection and try again.
      </div>
    );
  }

  if (q.data === false) {
    return null;
  }

  return <>{children}</>;
}
