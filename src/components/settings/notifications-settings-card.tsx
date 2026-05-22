"use client";

import { useEffect, useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import {
  getNotificationPreferencesRequest,
  updateNotificationPreferencesRequest,
  type NotificationCategories,
} from "@/features/notifications/api/notification-preferences-api";
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

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-background shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

function leadMinutesFromSelection(oneHour: boolean, oneDay: boolean): number[] {
  const values: number[] = [];
  if (oneHour) values.push(60);
  if (oneDay) values.push(1440);
  return values.length > 0 ? values : [60];
}

function selectionFromLeadMinutes(leadMinutes: number[]): {
  oneHour: boolean;
  oneDay: boolean;
} {
  return {
    oneHour: leadMinutes.includes(60),
    oneDay: leadMinutes.includes(1440),
  };
}

export function NotificationsSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<NotificationCategories | null>(null);
  const [draft, setDraft] = useState<NotificationCategories | null>(null);
  const [reminderOneHour, setReminderOneHour] = useState(true);
  const [reminderOneDay, setReminderOneDay] = useState(false);
  const [interviewOneHour, setInterviewOneHour] = useState(true);
  const [interviewOneDay, setInterviewOneDay] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const prefs = await getNotificationPreferencesRequest();
        if (cancelled) return;
        setSaved(prefs.categories);
        setDraft(prefs.categories);
        const reminderLead = selectionFromLeadMinutes(
          prefs.categories.reminders.leadMinutes,
        );
        const interviewLead = selectionFromLeadMinutes(
          prefs.categories.interviews.leadMinutes,
        );
        setReminderOneHour(reminderLead.oneHour);
        setReminderOneDay(reminderLead.oneDay);
        setInterviewOneHour(interviewLead.oneHour);
        setInterviewOneDay(interviewLead.oneDay);
      } catch (err) {
        if (!cancelled) toast.error(getApiErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!draft || !saved) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading preferences…
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const dirty =
    JSON.stringify({
      ...draft,
      reminders: {
        ...draft.reminders,
        leadMinutes: leadMinutesFromSelection(reminderOneHour, reminderOneDay),
      },
      interviews: {
        ...draft.interviews,
        leadMinutes: leadMinutesFromSelection(interviewOneHour, interviewOneDay),
      },
    }) !==
    JSON.stringify({
      ...saved,
      reminders: {
        ...saved.reminders,
        leadMinutes: selectionFromLeadMinutes(saved.reminders.leadMinutes),
      },
    });

  async function handleSave() {
    if (!draft) return;
    if (draft.matches.minMatchScore < 0 || draft.matches.minMatchScore > 100) {
      toast.error("Match score must be between 0 and 100.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...draft,
        reminders: {
          ...draft.reminders,
          leadMinutes: leadMinutesFromSelection(reminderOneHour, reminderOneDay),
        },
        interviews: {
          ...draft.interviews,
          leadMinutes: leadMinutesFromSelection(interviewOneHour, interviewOneDay),
        },
      };
      const updated = await updateNotificationPreferencesRequest({
        categories: payload,
      });
      setSaved(updated.categories);
      setDraft(updated.categories);
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
          Control alerts for job matches, reminders, and interviews.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Match alerts</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Notify when jobs score above your threshold.
              </p>
            </div>
            <ToggleSwitch
              label="Match alerts"
              checked={draft.matches.enabled}
              onChange={(enabled) =>
                setDraft({ ...draft, matches: { ...draft.matches, enabled } })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min-match-score">Minimum match score</Label>
            <Input
              id="min-match-score"
              type="number"
              min={0}
              max={100}
              value={draft.matches.minMatchScore}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  matches: {
                    ...draft.matches,
                    minMatchScore: Number(event.target.value),
                  },
                })
              }
            />
          </div>
        </section>

        <section className="space-y-3 border-t border-border pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Reminder notifications</p>
              <p className="mt-1 text-xs text-muted-foreground">
                In-app and email alerts before reminders are due.
              </p>
            </div>
            <ToggleSwitch
              label="Reminder notifications"
              checked={draft.reminders.enabled}
              onChange={(enabled) =>
                setDraft({
                  ...draft,
                  reminders: { ...draft.reminders, enabled },
                })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={reminderOneHour}
              onChange={(e) => setReminderOneHour(e.target.checked)}
            />
            1 hour before
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={reminderOneDay}
              onChange={(e) => setReminderOneDay(e.target.checked)}
            />
            1 day before
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.reminders.channels.email}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  reminders: {
                    ...draft.reminders,
                    channels: {
                      ...draft.reminders.channels,
                      email: e.target.checked,
                    },
                  },
                })
              }
            />
            Email
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.reminders.channels.inApp}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  reminders: {
                    ...draft.reminders,
                    channels: {
                      ...draft.reminders.channels,
                      inApp: e.target.checked,
                    },
                  },
                })
              }
            />
            In-app
          </label>
        </section>

        <section className="space-y-3 border-t border-border pt-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Interview notifications</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Alerts before scheduled interviews.
              </p>
            </div>
            <ToggleSwitch
              label="Interview notifications"
              checked={draft.interviews.enabled}
              onChange={(enabled) =>
                setDraft({
                  ...draft,
                  interviews: { ...draft.interviews, enabled },
                })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={interviewOneHour}
              onChange={(e) => setInterviewOneHour(e.target.checked)}
            />
            1 hour before
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={interviewOneDay}
              onChange={(e) => setInterviewOneDay(e.target.checked)}
            />
            1 day before
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.interviews.channels.email}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  interviews: {
                    ...draft.interviews,
                    channels: {
                      ...draft.interviews.channels,
                      email: e.target.checked,
                    },
                  },
                })
              }
            />
            Email
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.interviews.channels.inApp}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  interviews: {
                    ...draft.interviews,
                    channels: {
                      ...draft.interviews.channels,
                      inApp: e.target.checked,
                    },
                  },
                })
              }
            />
            In-app
          </label>
        </section>

        <section className="space-y-2 border-t border-border pt-5">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.matches.channels.email}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  matches: {
                    ...draft.matches,
                    channels: {
                      ...draft.matches.channels,
                      email: e.target.checked,
                    },
                  },
                })
              }
            />
            Email for match alerts
          </label>
        </section>

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
      </CardContent>
    </Card>
  );
}
