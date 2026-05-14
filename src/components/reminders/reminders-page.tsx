"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Bell,
  Check,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Link as LinkIcon,
  CalendarDays,
  X,
} from "lucide-react";
import { format, parseISO, isToday, isTomorrow, isPast, isThisWeek } from "date-fns";
import { toast } from "sonner";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import type { Reminder } from "@/types";

/* ─── Form schema ────────────────────────────────────────────────────────── */

const reminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z.string().min(1, "Due date is required"),
  applicationId: z.string().optional(),
});
type ReminderForm = z.infer<typeof reminderSchema>;

/* ─── Due date label ─────────────────────────────────────────────────────── */

function dueDateLabel(dateStr: string): { text: string; urgent: boolean } {
  const d = parseISO(dateStr);
  if (isPast(d) && !isToday(d)) return { text: "Overdue", urgent: true };
  if (isToday(d)) return { text: "Today", urgent: true };
  if (isTomorrow(d)) return { text: "Tomorrow", urgent: false };
  if (isThisWeek(d)) return { text: format(d, "EEEE"), urgent: false };
  return { text: format(d, "MMM d, yyyy"), urgent: false };
}

/* ─── Group reminders ────────────────────────────────────────────────────── */

function groupReminders(reminders: Reminder[]) {
  const overdue: Reminder[] = [];
  const upcoming: Reminder[] = [];
  const completed: Reminder[] = [];

  reminders.forEach((r) => {
    if (r.completed) {
      completed.push(r);
    } else if (isPast(parseISO(r.dueDate)) && !isToday(parseISO(r.dueDate))) {
      overdue.push(r);
    } else {
      upcoming.push(r);
    }
  });

  const byDate = (a: Reminder, b: Reminder) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();

  return {
    overdue: overdue.sort(byDate),
    upcoming: upcoming.sort(byDate),
    completed: completed.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ),
  };
}

/* ─── Create reminder drawer/inline form ─────────────────────────────────── */

interface CreateReminderFormProps {
  onClose: () => void;
}

function CreateReminderForm({ onClose }: CreateReminderFormProps) {
  const { applications, createReminder } = useApplicationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<ReminderForm>({ resolver: zodResolver(reminderSchema) });

  async function onSubmit(data: ReminderForm) {
    setIsSubmitting(true);
    try {
      const app = data.applicationId
        ? applications.find((a) => a.id === data.applicationId)
        : undefined;

      createReminder({
        title: data.title,
        description: data.description,
        dueDate: new Date(data.dueDate).toISOString(),
        applicationId: data.applicationId || undefined,
        application: app
          ? { id: app.id, jobTitle: app.jobTitle, company: app.company }
          : undefined,
      });
      toast.success("Reminder created");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-foreground">New reminder</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
          <div className="space-y-1.5">
            <Label className="text-[13px]">Title <span className="text-destructive">*</span></Label>
            <Input placeholder="e.g. Follow up with recruiter" {...register("title")} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px]">Description</Label>
            <Textarea
              placeholder="Optional details…"
              rows={2}
              className="text-[13px]"
              {...register("description")}
            />
          </div>

          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Due date <span className="text-destructive">*</span></Label>
              <Input type="datetime-local" {...register("dueDate")} />
              {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px]">Link to application</Label>
              {/* eslint-disable-next-line react-hooks/incompatible-library */}
              <Select value={watch("applicationId")} onValueChange={(v) => setValue("applicationId", v === "none" ? "" : v)}>
                <SelectTrigger className="text-[13px]">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {applications.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="text-[13px]">
                      {a.company} — {a.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Create reminder
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ─── Reminder row ───────────────────────────────────────────────────────── */

function ReminderRow({ reminder }: { reminder: Reminder }) {
  const { toggleReminder, deleteReminder } = useApplicationStore();
  const due = dueDateLabel(reminder.dueDate);

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-border px-4 py-3.5 transition-colors",
        reminder.completed
          ? "bg-muted/30 opacity-60"
          : "bg-card hover:bg-muted/20"
      )}
    >
      {/* Complete toggle */}
      <button
        onClick={() => {
          toggleReminder(reminder.id);
          toast.success(reminder.completed ? "Marked incomplete" : "Reminder completed");
        }}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          reminder.completed
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border hover:border-primary"
        )}
        aria-label={reminder.completed ? "Mark incomplete" : "Mark complete"}
      >
        {reminder.completed && <Check className="h-3 w-3" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-[13px] font-medium text-foreground", reminder.completed && "line-through text-muted-foreground")}>
          {reminder.title}
        </p>
        {reminder.description && (
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{reminder.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <span className={cn(
            "flex items-center gap-1 text-[11px] font-medium",
            due.urgent ? "text-red-500 dark:text-red-400" : "text-muted-foreground"
          )}>
            <CalendarDays className="h-3 w-3" />
            {due.text} · {format(parseISO(reminder.dueDate), "h:mm a")}
          </span>
          {reminder.application && (
            <span className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
              <LinkIcon className="h-3 w-3" />
              {reminder.application.company}
            </span>
          )}
        </div>
      </div>

      {/* Delete — shows on hover */}
      <button
        onClick={() => {
          deleteReminder(reminder.id);
          toast.success("Reminder deleted");
        }}
        className="mt-0.5 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
        aria-label="Delete reminder"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ─── Group section ──────────────────────────────────────────────────────── */

function ReminderGroup({
  title,
  reminders,
  defaultOpen = true,
  titleClassName,
}: {
  title: string;
  reminders: Reminder[];
  defaultOpen?: boolean;
  titleClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (reminders.length === 0) return null;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-1"
      >
        <div className="flex items-center gap-2">
          <span className={cn("text-[11px] font-semibold uppercase tracking-widest", titleClassName ?? "text-muted-foreground")}>
            {title}
          </span>
          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground tabular-nums">
            {reminders.length}
          </span>
        </div>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-2">
          {reminders.map((r) => <ReminderRow key={r.id} reminder={r} />)}
        </div>
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */

export function RemindersPage() {
  const { getReminders } = useApplicationStore();
  const [showForm, setShowForm] = useState(false);

  const allReminders = getReminders();
  const { overdue, upcoming, completed } = useMemo(() => groupReminders(allReminders), [allReminders]);
  const totalActive = overdue.length + upcoming.length;

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Reminders</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {totalActive} active reminder{totalActive !== 1 ? "s" : ""}
            {completed.length > 0 && `, ${completed.length} completed`}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-3.5 w-3.5" />
          Add reminder
        </Button>
      </div>

      {/* Create form */}
      {showForm && <CreateReminderForm onClose={() => setShowForm(false)} />}

      {/* Groups */}
      {allReminders.length === 0 && !showForm ? (
        <EmptyState
          icon={Bell}
          title="No reminders yet"
          description="Create reminders to stay on top of follow-ups, deadlines, and next steps."
          action={
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add first reminder
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <ReminderGroup
            title="Overdue"
            reminders={overdue}
            titleClassName="text-red-500 dark:text-red-400"
          />
          <ReminderGroup title="Upcoming" reminders={upcoming} />
          <ReminderGroup title="Completed" reminders={completed} defaultOpen={false} />
        </div>
      )}
    </div>
  );
}
