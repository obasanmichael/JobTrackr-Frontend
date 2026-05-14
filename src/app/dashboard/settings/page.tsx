"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LogOut, User } from "lucide-react";

export default function SettingsPage() {
  const { user, logout } = useAuth();

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
