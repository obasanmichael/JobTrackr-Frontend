import { useId } from "react";
import { cn } from "@/lib/utils";

/** JobTrackr mark — same artwork as `app/icon.svg`. */
export function Logo({ className }: { className?: string }) {
  const gradientId = useId();
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      className={cn("shrink-0", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6366F1" />
          <stop offset="1" stopColor="#4338CA" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${gradientId})`} />
      <path
        d="M23 21v-3.5A3.5 3.5 0 0 1 26.5 14h11a3.5 3.5 0 0 1 3.5 3.5V21"
        fill="none"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="11" y="21" width="42" height="29" rx="7" fill="#fff" />
      <path
        d="M22 36.5l7 7 13.5-14"
        fill="none"
        stroke="#4F46E5"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
