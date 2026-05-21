"use client";

import { useState } from "react";
import { Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { changePasswordRequest } from "@/features/auth/api/auth-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SecuritySettingsCard() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const passwordsMatch = newPassword === confirmPassword;
  const canSubmit =
    currentPassword.length >= 8 &&
    newPassword.length >= 8 &&
    passwordsMatch &&
    newPassword !== currentPassword;

  async function handleChangePassword() {
    if (!canSubmit) return;

    setSaving(true);
    try {
      await changePasswordRequest({
        currentPassword,
        newPassword,
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
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
          <Shield className="h-4 w-4 text-muted-foreground" />
          Security
        </CardTitle>
        <CardDescription>
          Manage your sign-in credentials and account access.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="security-email">Email</Label>
          <Input
            id="security-email"
            value={user?.email ?? ""}
            disabled
            readOnly
          />
          <p className="text-xs text-muted-foreground">
            Email changes are not available yet. Contact support if you need to
            update your login email.
          </p>
        </div>

        <div className="space-y-4 border-t border-border pt-5">
          <div>
            <h3 className="text-sm font-medium text-foreground">
              Change password
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Use at least 8 characters. You will stay signed in on this device.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            {confirmPassword && !passwordsMatch ? (
              <p className="text-xs text-destructive">Passwords do not match.</p>
            ) : null}
          </div>

          <Button
            type="button"
            size="sm"
            disabled={!canSubmit || saving}
            onClick={() => void handleChangePassword()}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating…
              </>
            ) : (
              "Update password"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
