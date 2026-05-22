"use client";

import { LogOut, ChevronDown, Menu } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { UserAvatar } from "@/components/user/user-avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, []);

  return (
    <header className="flex h-[57px] shrink-0 items-center justify-between gap-3 border-b border-border bg-background px-4 sm:px-5">
      {/* Left, hamburger (mobile only) */}
      <button
        onClick={onMenuClick}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer so right side stays right-aligned on desktop (where hamburger is hidden) */}
      <div className="hidden lg:block" />

      {/* Right, theme toggle + user menu */}
      <div className="flex items-center gap-1">
        <ThemeToggle />

        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-accent sm:px-2.5",
              menuOpen && "bg-accent"
            )}
          >
            <UserAvatar
              name={user?.name}
              avatarUrl={user?.avatarUrl}
              size="sm"
            />
            <span className="hidden max-w-[120px] truncate text-[13px] font-medium text-foreground sm:block">
              {user?.name ?? "Account"}
            </span>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-150",
                menuOpen && "rotate-180"
              )}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-52 overflow-hidden rounded-xl border border-border bg-popover shadow-lg shadow-black/5">
              <div className="border-b border-border px-3.5 py-3">
                <p className="truncate text-[13px] font-semibold text-foreground">{user?.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-foreground transition-colors hover:bg-accent"
                >
                  <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
