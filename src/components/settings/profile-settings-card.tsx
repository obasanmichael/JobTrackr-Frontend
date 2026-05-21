"use client";

import { useState } from "react";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { updateUserProfileRequest } from "@/features/users/api/users-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { ProfilePhotoMenu } from "@/components/settings/profile-photo-menu";
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

export function ProfileSettingsCard() {
  const { user, refreshUser } = useAuth();

  const savedName = user?.name ?? "";
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const name = nameDraft ?? savedName;

  const nameDirty = user ? name.trim() !== savedName : false;

  async function handleSaveName() {
    const trimmed = name.trim();
    if (!trimmed || !user) return;

    setSavingName(true);
    try {
      await updateUserProfileRequest({ name: trimmed });
      await refreshUser();
      setNameDraft(null);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSavingName(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Profile
        </CardTitle>
        <CardDescription>
          Update your display name and profile photo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <ProfilePhotoMenu />
          <p className="text-sm text-muted-foreground">
            Tap your photo to view, change, or remove it.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-name">Display name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setNameDraft(event.target.value)}
            placeholder="Your name"
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input
            id="profile-email"
            value={user?.email ?? ""}
            disabled
            readOnly
          />
          <p className="text-xs text-muted-foreground">
            Email changes are not available yet.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          disabled={!nameDirty || savingName || !name.trim()}
          onClick={() => void handleSaveName()}
        >
          {savingName ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
