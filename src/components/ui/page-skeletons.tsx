import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Mirrors `PageHeader` (title + description + optional action). */
export function PageHeaderSkeleton({ action = false }: { action?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {action && <Skeleton className="h-8 w-32 rounded-lg" />}
    </div>
  );
}

function Wrapper({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className={cn("space-y-6", className)}>
      {children}
    </div>
  );
}

/** Two-column grid of job cards (matched jobs, saved jobs). */
export function JobCardsSkeleton({
  count = 6,
  label = "Loading jobs",
  header = true,
  headerAction = false,
}: {
  count?: number;
  label?: string;
  header?: boolean;
  headerAction?: boolean;
}) {
  return (
    <Wrapper label={label}>
      {header && <PageHeaderSkeleton action={headerAction} />}
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="flex flex-col gap-3 border-border/80 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3.5 w-2/5" />
              </div>
              <Skeleton className="h-6 w-10 rounded-full" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </Card>
        ))}
      </div>
    </Wrapper>
  );
}

/** Stacked card rows with a header (billing, calendar settings, job sources...). */
export function CardStackSkeleton({
  count = 3,
  label = "Loading",
  header = true,
  headerAction = false,
}: {
  count?: number;
  label?: string;
  header?: boolean;
  headerAction?: boolean;
}) {
  return (
    <Wrapper label={label}>
      {header && <PageHeaderSkeleton action={headerAction} />}
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3.5 w-full max-w-md" />
              <Skeleton className="h-3.5 w-2/3 max-w-sm" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    </Wrapper>
  );
}

/** Table-body rows, e.g. admin lists. Renders `<tr>`s — use inside `<tbody>`. */
export function TableRowsSkeleton({ rows = 6, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} aria-hidden>
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="px-4 py-3">
              <Skeleton className={cn("h-4", c === 0 ? "w-32" : "w-20")} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

/** Simple list rows inside a container the caller already provides. */
export function ListRowsSkeleton({
  rows = 5,
  label = "Loading",
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div role="status" aria-busy="true" aria-label={label} className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-xl border border-border p-4">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Detail page: header, hero card and two content blocks. */
export function DetailSkeleton({ label = "Loading details" }: { label?: string }) {
  return (
    <Wrapper label={label}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Card>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-3/4" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="space-y-3 p-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    </Wrapper>
  );
}

/** Calendar grid placeholder (inside a Card the caller provides). */
export function CalendarGridSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading schedule" className="space-y-4 p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/** Suspense fallback for the auth pages (login, register, forgot/reset password). */
export function AuthFormSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className="flex min-h-screen items-center justify-center bg-background px-8"
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-60" />
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
