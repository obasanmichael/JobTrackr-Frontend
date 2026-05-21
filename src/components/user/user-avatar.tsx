"use client";

import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name?: string | null;
  avatarUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-20 w-20 text-lg",
};

function initialsFromName(name?: string | null): string {
  if (!name?.trim()) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function UserAvatar({
  name,
  avatarUrl,
  className,
  size = "md",
}: UserAvatarProps) {
  const initials = initialsFromName(name);

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name ? `${name}'s avatar` : "User avatar"}
        className={cn(
          "shrink-0 rounded-full object-cover bg-muted",
          sizeClasses[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground",
        sizeClasses[size],
        className
      )}
      aria-hidden={!name}
    >
      {initials}
    </div>
  );
}

export { initialsFromName };
