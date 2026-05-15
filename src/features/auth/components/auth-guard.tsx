"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [ready, user, router, pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center bg-background">
        <Loader2
          className="h-8 w-8 animate-spin text-muted-foreground"
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
