"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import {
  getMatchAlertPreferencesRequest,
  updateMatchAlertPreferencesRequest,
} from "@/features/matching/api/match-alert-api";
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
import { cn } from "@/lib/utils";

export function NotificationsSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [minMatchScore, setMinMatchScore] = useState(70);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [savedEnabled, setSavedEnabled] = useState(false);
  const [savedMinMatchScore, setSavedMinMatchScore] = useState(70);
  const [savedEmailEnabled, setSavedEmailEnabled] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const prefs = await getMatchAlertPreferencesRequest();
        if (cancelled) return;

        const email = prefs.channels?.email ?? true;
        setEnabled(prefs.enabled);
        setMinMatchScore(prefs.minMatchScore);
        setEmailEnabled(email);
        setSavedEnabled(prefs.enabled);
        setSavedMinMatchScore(prefs.minMatchScore);
        setSavedEmailEnabled(email);
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const dirty =
    enabled !== savedEnabled ||
    minMatchScore !== savedMinMatchScore ||
    emailEnabled !== savedEmailEnabled;

  async function handleSave() {
    if (minMatchScore < 0 || minMatchScore > 100) {
      toast.error("Match score must be between 0 and 100.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateMatchAlertPreferencesRequest({
        enabled,
        minMatchScore,
        channels: { email: emailEnabled, push: false },
      });
      setSavedEnabled(updated.enabled);
      setSavedMinMatchScore(updated.minMatchScore);
      setSavedEmailEnabled(updated.channels?.email ?? emailEnabled);
      toast.success("Notification preferences saved");
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
          <Bell className="h-4 w-4 text-muted-foreground" />
          Notifications
        </CardTitle>
        <CardDescription>
          Get notified when new jobs match your profile above a score threshold.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading preferences…
          </div>
        ) : (
          <>
            <label className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Match alerts
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Turn on alerts for high-scoring job matches.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled((value) => !value)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
                  enabled ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow transition-transform",
                    enabled ? "translate-x-5" : "translate-x-0",
                  )}
                />
              </button>
            </label>

            <div className="space-y-2">
              <Label htmlFor="min-match-score">Minimum match score</Label>
              <Input
                id="min-match-score"
                type="number"
                min={0}
                max={100}
                value={minMatchScore}
                onChange={(event) =>
                  setMinMatchScore(Number(event.target.value))
                }
              />
              <p className="text-xs text-muted-foreground">
                Only jobs scoring at or above this threshold trigger alerts.
              </p>
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-border"
                checked={emailEnabled}
                onChange={(event) => setEmailEnabled(event.target.checked)}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Email notifications
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Delivery is being rolled out. Preferences are saved now.
                </p>
              </div>
            </label>

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
                "Save preferences"
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
