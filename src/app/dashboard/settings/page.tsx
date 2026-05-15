"use client";

import { useTheme } from "next-themes";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useMounted } from "@/hooks/useMounted";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LogOut, User, Palette, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

type ThemeOption = { value: string; label: string; icon: React.ElementType };

const THEME_OPTIONS: ThemeOption[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account preferences.</p>
      </div>

      <div className="space-y-4">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Profile
            </CardTitle>
            <CardDescription>Your account information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-[120px_1fr] items-center gap-2 text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user?.name ?? "—"}</span>
            </div>
            <Separator />
            <div className="grid grid-cols-[120px_1fr] items-center gap-2 text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" />
              Appearance
            </CardTitle>
            <CardDescription>Choose how JobTrackr looks on your device.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {mounted ? THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-xl border-2 px-4 py-3.5 text-center transition-all",
                    theme === value
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted/40"
                  )}
                >
                  <Icon className={cn("h-5 w-5", theme === value && "text-primary")} />
                  <span className={cn("text-[12px] font-medium", theme === value ? "text-foreground" : "text-muted-foreground")}>
                    {label}
                  </span>
                </button>
              )) : (
                <div className="flex w-full items-center gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 flex-1 animate-pulse rounded-xl bg-muted" />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Session */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LogOut className="h-4 w-4 text-muted-foreground" />
              Session
            </CardTitle>
            <CardDescription>Sign out of your account on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
