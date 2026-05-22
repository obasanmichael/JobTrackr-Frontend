"use client";

import { useState } from "react";
import { Loader2, Palette, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { updateUserProfileRequest } from "@/features/users/api/users-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { useMounted } from "@/hooks/useMounted";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ThemeOption = { value: "light" | "dark" | "system"; label: string; icon: React.ElementType };

const THEME_OPTIONS: ThemeOption[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function AppearanceSettingsCard() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [saving, setSaving] = useState(false);

  const savedTheme = user?.themePreference ?? "system";
  const activeTheme = (theme ?? savedTheme) as ThemeOption["value"];
  const dirty = activeTheme !== savedTheme;

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserProfileRequest({ themePreference: activeTheme });
      await refreshUser();
      toast.success("Appearance saved");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          Appearance
        </CardTitle>
        <CardDescription>
          Choose how JobTrackr looks. Saved to your account and synced across devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          {mounted ? (
            THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-2 rounded-xl border-2 px-4 py-3.5 text-center transition-all",
                  activeTheme === value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-border/80 hover:bg-muted/40",
                )}
              >
                <Icon className={cn("h-5 w-5", activeTheme === value && "text-primary")} />
                <span
                  className={cn(
                    "text-[12px] font-medium",
                    activeTheme === value ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </button>
            ))
          ) : (
            <div className="flex w-full items-center gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 flex-1 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          )}
        </div>

        <Button
          type="button"
          size="sm"
          disabled={!dirty || saving}
          onClick={() => void handleSave()}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save appearance"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
