import { cn } from "@/lib/utils";
import { STATUS_STYLES } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: "sm" | "default";
}

export function StatusBadge({ status, className, size = "default" }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? {
    label: status,
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400",
    dot: "bg-zinc-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "default" ? "px-2.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-[10px]",
        style.className,
        className
      )}
    >
      <span className={cn("rounded-full shrink-0", size === "default" ? "h-1.5 w-1.5" : "h-1 w-1", style.dot)} />
      {style.label}
    </span>
  );
}
