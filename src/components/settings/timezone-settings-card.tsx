"use client";

import { useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { updateUserProfileRequest } from "@/features/users/api/users-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import {
  buildTimezoneOptions,
  formatTimezoneLabel,
  getDeviceTimezone,
} from "@/lib/timezones";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TimezoneSettingsCard() {
  const { user, refreshUser } = useAuth();
  const deviceTimezone = getDeviceTimezone();
  const savedTimezone = user?.timezone ?? deviceTimezone;
  const [timezoneDraft, setTimezoneDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const timezone = timezoneDraft ?? savedTimezone;

  const options = buildTimezoneOptions(timezone);
  const dirty = user?.timezone == null || timezone !== user.timezone;

  async function handleSave() {
    setSaving(true);
    try {
      await updateUserProfileRequest({ timezone });
      await refreshUser();
      setTimezoneDraft(null);
      toast.success("Timezone updated");
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
          <Clock className="h-4 w-4 text-muted-foreground" />
          Timezone
        </CardTitle>
        <CardDescription>
          Used for reminders, interviews, and scheduled notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="timezone-select">Your timezone</Label>
          <Select value={timezone} onValueChange={setTimezoneDraft}>
            <SelectTrigger id="timezone-select">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {formatTimezoneLabel(option)}
                  {option === deviceTimezone ? " · device" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!user?.timezone ? (
            <p className="text-xs text-muted-foreground">
              No timezone saved yet. Your device default is{" "}
              {formatTimezoneLabel(deviceTimezone)}.
            </p>
          ) : null}
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
            "Save timezone"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
