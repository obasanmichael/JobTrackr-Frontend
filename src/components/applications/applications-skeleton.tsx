import { Skeleton } from "@/components/ui/skeleton";

export function ApplicationsListSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      {/* Filter bar */}
      <div className="flex gap-3">
        <Skeleton className="h-9 w-64 rounded-lg" />
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-16 rounded-full" />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="border-b border-border bg-muted/40 px-4 py-2.5">
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="divide-y divide-border">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5">
              <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="hidden sm:block h-5 w-24 rounded-full" />
              <Skeleton className="hidden sm:block h-3 w-24" />
              <Skeleton className="hidden sm:block h-3 w-12" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ApplicationDetailSkeleton() {
  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-28 rounded-md" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Header card */}
      <div className="rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-start gap-3.5">
          <Skeleton className="h-11 w-11 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
        <div className="border-t border-border pt-4 flex items-center gap-3">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-xl border border-border p-5 space-y-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <div className="rounded-xl border border-border p-5 space-y-4">
            <Skeleton className="h-4 w-20" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5 pt-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4 lg:col-span-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border p-5 space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
