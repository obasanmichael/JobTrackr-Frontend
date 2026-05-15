"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  Plus,
  CalendarCheck,
  Pencil,
  Trash2,
  X,
  Loader2,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import { format, parseISO, isFuture, isToday } from "date-fns";
import { toast } from "sonner";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
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
import { INTERVIEW_STAGES, INTERVIEW_TYPES } from "@/lib/constants";
import type { Interview } from "@/types";
import type { InterviewStage, InterviewType } from "@/lib/constants";

/* ─── Schema ─────────────────────────────────────────────────────────────── */

const interviewSchema = z.object({
  applicationId: z.string().min(1, "Application is required"),
  stage: z.enum(INTERVIEW_STAGES),
  type: z.enum(INTERVIEW_TYPES),
  scheduledAt: z.string().min(1, "Scheduled date & time is required"),
  location: z.string().optional(),
  notes: z.string().optional(),
  outcome: z.string().optional(),
});
type InterviewForm = z.infer<typeof interviewSchema>;

/* ─── Outcome badge ──────────────────────────────────────────────────────── */

const OUTCOME_STYLES: Record<string, string> = {
  Passed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Failed: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

function OutcomeBadge({ outcome }: { outcome?: string }) {
  if (!outcome) return null;
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", OUTCOME_STYLES[outcome] ?? "bg-secondary text-secondary-foreground")}>
      {outcome}
    </span>
  );
}

/* ─── Create/Edit form ───────────────────────────────────────────────────── */

interface InterviewFormPanelProps {
  existing?: Interview;
  onClose: () => void;
}

function InterviewFormPanel({ existing, onClose }: InterviewFormPanelProps) {
  const { applications, createInterview, updateInterview } = useApplicationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = Boolean(existing);

  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<InterviewForm>({
      resolver: zodResolver(interviewSchema),
      defaultValues: existing
        ? {
            applicationId: existing.applicationId,
            stage: existing.stage,
            type: existing.type,
            scheduledAt: existing.scheduledAt ? existing.scheduledAt.slice(0, 16) : "",
            location: existing.location ?? "",
            notes: existing.notes ?? "",
            outcome: existing.outcome ?? "",
          }
        : { stage: "Technical Interview", type: "Video" },
    });

  async function onSubmit(rawData: unknown) {
    const data = rawData as InterviewForm;
    setIsSubmitting(true);
    try {
      const scheduledAt = new Date(data.scheduledAt).toISOString();

      if (isEdit && existing) {
        await updateInterview(existing.id, {
          stage: data.stage,
          type: data.type,
          scheduledAt,
          location: data.location || undefined,
          notes: data.notes || undefined,
          outcome: data.outcome || undefined,
        });
        toast.success("Interview updated");
      } else {
        await createInterview({
          applicationId: data.applicationId,
          stage: data.stage,
          type: data.type,
          scheduledAt,
          location: data.location || undefined,
          notes: data.notes || undefined,
          outcome: data.outcome || undefined,
        });
        toast.success("Interview added");
      }
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-primary/20 shadow-sm">
      <CardContent className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-foreground">
            {isEdit ? "Edit interview" : "Log interview"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
          {/* Application */}
          {!isEdit && (
            <div className="space-y-1.5">
              <Label className="text-[13px]">Application <span className="text-destructive">*</span></Label>
              {/* eslint-disable-next-line react-hooks/incompatible-library */}
              <Select value={watch("applicationId")} onValueChange={(v) => setValue("applicationId", v)}>
                <SelectTrigger className="text-[13px]">
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  {applications.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="text-[13px]">
                      {a.company} — {a.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.applicationId && <p className="text-xs text-destructive">{errors.applicationId.message}</p>}
            </div>
          )}

          {/* Stage + Type */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Stage</Label>
              <Select value={watch("stage")} onValueChange={(v) => setValue("stage", v as InterviewStage)}>
                <SelectTrigger className="text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_STAGES.map((s) => (
                    <SelectItem key={s} value={s} className="text-[13px]">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[13px]">Type</Label>
              <Select value={watch("type")} onValueChange={(v) => setValue("type", v as InterviewType)}>
                <SelectTrigger className="text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVIEW_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="text-[13px]">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date + location */}
          <div className="grid gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Date &amp; time <span className="text-destructive">*</span></Label>
              <Input type="datetime-local" className="text-[13px]" {...register("scheduledAt")} />
              {errors.scheduledAt && <p className="text-xs text-destructive">{errors.scheduledAt.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Location / link</Label>
              <Input placeholder="e.g. Google Meet, Onsite" className="text-[13px]" {...register("location")} />
            </div>
          </div>

          {/* Outcome */}
          <div className="space-y-1.5">
            <Label className="text-[13px]">Outcome</Label>
            <Select value={watch("outcome")} onValueChange={(v) => setValue("outcome", v === "none" ? "" : v)}>
              <SelectTrigger className="text-[13px]">
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-[13px]">Not set</SelectItem>
                <SelectItem value="Passed" className="text-[13px]">Passed</SelectItem>
                <SelectItem value="Failed" className="text-[13px]">Failed</SelectItem>
                <SelectItem value="Pending" className="text-[13px]">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label className="text-[13px]">Notes</Label>
            <Textarea
              placeholder="Topics to cover, questions asked, observations…"
              rows={3}
              className="text-[13px]"
              {...register("notes")}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEdit ? "Save changes" : "Log interview"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ─── Interview card ─────────────────────────────────────────────────────── */

function InterviewCard({ interview }: { interview: Interview }) {
  const { deleteInterview } = useApplicationStore();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (editing) {
    return <InterviewFormPanel existing={interview} onClose={() => setEditing(false)} />;
  }

  const isUpcoming = interview.scheduledAt
    ? isFuture(parseISO(interview.scheduledAt)) || isToday(parseISO(interview.scheduledAt))
    : false;

  return (
    <div className="group rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/20">
      <div className="flex items-start justify-between gap-3">
        {/* Left */}
        <div className="flex items-start gap-3 min-w-0">
          {/* Status dot */}
          <div className={cn(
            "mt-1 h-2 w-2 shrink-0 rounded-full",
            interview.outcome === "Passed"
              ? "bg-emerald-500"
              : interview.outcome === "Failed"
              ? "bg-red-500"
              : isUpcoming
              ? "bg-primary"
              : "bg-muted-foreground/40"
          )} />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {interview.applicationId ? (
                <Link
                  href={`/dashboard/applications/${interview.applicationId}`}
                  className="group/link flex items-center gap-1 text-[13px] font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {interview.application?.company ?? "Unknown company"}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-60 transition-opacity" />
                </Link>
              ) : (
                <span className="text-[13px] font-semibold text-foreground">
                  {interview.application?.company ?? "Unknown company"}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">
                {interview.application?.jobTitle}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                {interview.stage}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                {interview.type}
              </span>
              <OutcomeBadge outcome={interview.outcome} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {interview.scheduledAt && (
                <span className={cn(
                  "flex items-center gap-1",
                  isUpcoming && "text-primary font-medium"
                )}>
                  <Clock className="h-3 w-3" />
                  {format(parseISO(interview.scheduledAt), "MMM d, yyyy · h:mm a")}
                </span>
              )}
              {interview.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {interview.location}
                </span>
              )}
            </div>

            {interview.notes && (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                {interview.notes}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setEditing(true)}
            aria-label="Edit interview"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {!confirmDelete ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete interview"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <div className="flex items-center gap-1 rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1">
              <button
                onClick={async () => {
                  try {
                    await deleteInterview(interview.id);
                    toast.success("Interview deleted");
                  } catch (err) {
                    toast.error(getApiErrorMessage(err));
                    setConfirmDelete(false);
                  }
                }}
                className="text-[11px] font-semibold text-destructive hover:underline"
              >
                Delete
              </button>
              <span className="text-muted-foreground/40 text-[11px]">·</span>
              <button onClick={() => setConfirmDelete(false)} className="text-[11px] text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Group section ──────────────────────────────────────────────────────── */

function InterviewGroup({
  title,
  interviews,
  defaultOpen = true,
  titleClassName,
}: {
  title: string;
  interviews: Interview[];
  defaultOpen?: boolean;
  titleClassName?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (interviews.length === 0) return null;

  return (
    <div className="space-y-2">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between py-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-[11px] font-semibold uppercase tracking-widest", titleClassName ?? "text-muted-foreground")}>
            {title}
          </span>
          <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground tabular-nums">
            {interviews.length}
          </span>
        </div>
        {open ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      {open && (
        <div className="space-y-2">
          {interviews.map((iv) => <InterviewCard key={iv.id} interview={iv} />)}
        </div>
      )}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */

export function InterviewsPage() {
  const { getInterviews, refreshApplications, refreshInterviews } = useApplicationStore();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    void refreshApplications();
    void refreshInterviews();
  }, [refreshApplications, refreshInterviews]);

  const allInterviews = getInterviews();

  const { upcoming, past } = useMemo(() => {
    const upcoming: Interview[] = [];
    const past: Interview[] = [];

    allInterviews.forEach((iv) => {
      if (!iv.scheduledAt || isFuture(parseISO(iv.scheduledAt)) || isToday(parseISO(iv.scheduledAt))) {
        upcoming.push(iv);
      } else {
        past.push(iv);
      }
    });

    const byDate = (a: Interview, b: Interview) =>
      new Date(a.scheduledAt ?? 0).getTime() - new Date(b.scheduledAt ?? 0).getTime();

    return {
      upcoming: upcoming.sort(byDate),
      past: past.sort((a, b) => byDate(b, a)),
    };
  }, [allInterviews]);

  return (
    <div className="max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Interviews</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {upcoming.length} upcoming · {past.length} past
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="h-3.5 w-3.5" />
          Log interview
        </Button>
      </div>

      {/* Create form */}
      {showForm && <InterviewFormPanel onClose={() => setShowForm(false)} />}

      {/* Groups */}
      {allInterviews.length === 0 && !showForm ? (
        <EmptyState
          icon={CalendarCheck}
          title="No interviews logged"
          description="Log your interviews to track stages, notes, and outcomes for each application."
          action={
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-3.5 w-3.5" />
              Log first interview
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <InterviewGroup
            title="Upcoming"
            interviews={upcoming}
            titleClassName="text-primary"
          />
          <InterviewGroup
            title="Past"
            interviews={past}
            defaultOpen={false}
          />
        </div>
      )}
    </div>
  );
}
