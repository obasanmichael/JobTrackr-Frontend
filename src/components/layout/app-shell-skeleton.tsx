import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

/** Full-page placeholder (sidebar + header + content) shown while auth state resolves. */
export function AppShellSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden h-full w-56 shrink-0 flex-col bg-sidebar lg:flex">
        <div className="flex h-[57px] items-center gap-2.5 border-b border-sidebar-border px-5">
          <Skeleton className="h-7 w-7 rounded-lg !bg-none !bg-sidebar-accent" />
          <Skeleton className="h-3.5 w-20 !bg-none !bg-sidebar-accent" />
        </div>
        <div className="space-y-2 px-2.5 py-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg !bg-none !bg-sidebar-accent" />
          ))}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-[57px] shrink-0 items-center justify-between border-b border-border px-4 sm:px-5">
          <Skeleton className="h-8 w-8 rounded-lg lg:hidden" />
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    </div>
  );
}
