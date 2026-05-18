import type { ResumeParseStatus } from "@/types";
import { cn } from "@/lib/utils";

const STYLES: Record<ResumeParseStatus, { label: string; className: string }> = {
  UPLOADED: {
    label: "Queued",
    className: "bg-muted text-muted-foreground",
  },
  PARSING: {
    label: "Parsing",
    className: "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200",
  },
  PARSED: {
    label: "Parsed",
    className: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200",
  },
  FAILED: {
    label: "Parse failed",
    className: "bg-red-100 text-red-900 dark:bg-red-950/50 dark:text-red-200",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-muted text-muted-foreground",
  },
};

export function ResumeStatusBadge({
  status,
  className,
}: {
  status: ResumeParseStatus;
  className?: string;
}) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-tight",
        s.className,
        className
      )}
    >
      {s.label}
    </span>
  );
}
