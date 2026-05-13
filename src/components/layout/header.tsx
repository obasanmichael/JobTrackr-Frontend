"use client";

import { LogOut, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      {title && (
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      )}
      {!title && <div />}

      <div className="flex items-center gap-2">
        <ThemeToggle />

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className={cn(
              "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {initials}
            </div>
            <span className="hidden text-sm font-medium text-foreground sm:block">
              {user?.name ?? "Account"}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-border bg-popover p-1 shadow-md">
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <div className="my-1 h-px bg-border" />
              <button
                onClick={() => { setMenuOpen(false); logout(); }}
                className="flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-sm text-foreground hover:bg-accent transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
