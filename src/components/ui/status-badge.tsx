import { cn } from "@/lib/utils";
import { STATUS_STYLES } from "@/lib/constants";
import type { ApplicationStatus } from "@/lib/constants";

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        style.className,
        className
      )}
    >
      {showDot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      )}
      {style.label}
    </span>
  );
}
