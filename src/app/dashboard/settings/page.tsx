"use client";

import { ProfileSettingsCard } from "@/components/settings/profile-settings-card";
import { SecuritySettingsCard } from "@/components/settings/security-settings-card";
import { NotificationsSettingsCard } from "@/components/settings/notifications-settings-card";
import { TimezoneSettingsCard } from "@/components/settings/timezone-settings-card";
import { AppearanceSettingsCard } from "@/components/settings/appearance-settings-card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogOut } from "lucide-react";

export default function SettingsPage() {
  const { logout } = useAuth();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account preferences.</p>
      </div>

      <div className="space-y-4">
        <ProfileSettingsCard />
        <SecuritySettingsCard />
        <NotificationsSettingsCard />
        <TimezoneSettingsCard />
        <AppearanceSettingsCard />

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
