"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMounted } from "@/hooks/useMounted";
import { ApplicationDetailSkeleton } from "./applications-skeleton";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Briefcase,
  DollarSign,
  CalendarDays,
  Globe,
  Tag,
  Pencil,
  Trash2,
  Bell,
  CalendarCheck,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimelineSection } from "./timeline-section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPLICATION_STATUSES, INTERVIEW_STAGES, INTERVIEW_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ApplicationStatus, InterviewStage, InterviewType } from "@/lib/constants";

interface ApplicationDetailProps {
  id: string;
}

function DetailRow({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border last:border-0">
      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-[13px] text-foreground">{value}</p>
      </div>
    </div>
  );
}

/* ─── Inline reminder form ───────────────────────────────────────────────── */

const quickReminderSchema = z.object({
  title: z.string().min(1, "Title is required"),
  dueDate: z.string().min(1, "Due date is required"),
});
type QuickReminderForm = z.infer<typeof quickReminderSchema>;

function InlineReminderForm({
  applicationId,
  applicationName,
  onClose,
}: {
  applicationId: string;
  applicationName: string;
  onClose: () => void;
}) {
  const { createReminder, addEvent } = useApplicationStore();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<QuickReminderForm>({
    resolver: zodResolver(quickReminderSchema),
  });

  async function onSubmit(data: QuickReminderForm) {
    setSubmitting(true);
    try {
      const reminder = await createReminder({
        title: data.title,
        dueDate: new Date(data.dueDate).toISOString(),
        applicationId,
      });
      await addEvent(applicationId, {
        type: "Reminder Created",
        content: `Reminder set: "${reminder.title}", due ${format(parseISO(reminder.dueDate), "MMM d, yyyy")}`,
      });
      toast.success("Reminder created");
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-2.5 rounded-lg border border-border bg-muted/30 p-3" noValidate>
      <p className="text-[11px] text-muted-foreground">Linked to: <span className="font-medium text-foreground">{applicationName}</span></p>
      <div className="space-y-1">
        <Label className="text-[11px]">Title</Label>
        <Input placeholder="e.g. Follow up with recruiter" className="h-8 text-[13px]" {...register("title")} />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Due date</Label>
        <Input type="datetime-local" className="h-8 text-[13px]" {...register("dueDate")} />
        {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate.message}</p>}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-7 text-xs" disabled={submitting}>
          {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* ─── Inline interview form ──────────────────────────────────────────────── */

const quickInterviewSchema = z.object({
  stage: z.enum(INTERVIEW_STAGES),
  type: z.enum(INTERVIEW_TYPES),
  scheduledAt: z.string().min(1, "Date & time is required"),
});
type QuickInterviewForm = z.infer<typeof quickInterviewSchema>;

function InlineInterviewForm({
  applicationId,
  onClose,
}: {
  applicationId: string;
  onClose: () => void;
}) {
  const { createInterview, addEvent } = useApplicationStore();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<QuickInterviewForm>({
    resolver: zodResolver(quickInterviewSchema),
    defaultValues: { stage: "Technical Interview", type: "Video" },
  });

  async function onSubmit(rawData: unknown) {
    const data = rawData as QuickInterviewForm;
    setSubmitting(true);
    try {
      const scheduledAt = new Date(data.scheduledAt).toISOString();
      await createInterview({
        applicationId,
        stage: data.stage,
        type: data.type,
        scheduledAt,
      });
      await addEvent(applicationId, {
        type: "Interview Update",
        content: `Interview logged: ${data.stage} (${data.type}) on ${format(new Date(data.scheduledAt), "MMM d, h:mm a")}`,
      });
      toast.success("Interview logged");
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-3 space-y-2.5 rounded-lg border border-border bg-muted/30 p-3" noValidate>
      <div className="space-y-1">
        <Label className="text-[11px]">Stage</Label>
        {/* eslint-disable-next-line react-hooks/incompatible-library */}
        <Select value={watch("stage")} onValueChange={(v) => setValue("stage", v as InterviewStage)}>
          <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {INTERVIEW_STAGES.map((s) => <SelectItem key={s} value={s} className="text-[13px]">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Type</Label>
        <Select value={watch("type")} onValueChange={(v) => setValue("type", v as InterviewType)}>
          <SelectTrigger className="h-8 text-[13px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {INTERVIEW_TYPES.map((t) => <SelectItem key={t} value={t} className="text-[13px]">{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Date &amp; time <span className="text-destructive">*</span></Label>
        <Input type="datetime-local" className="h-8 text-[13px]" {...register("scheduledAt")} />
        {errors.scheduledAt && <p className="text-xs text-destructive">{errors.scheduledAt.message}</p>}
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" className="h-7 text-xs" disabled={submitting}>
          {submitting && <Loader2 className="h-3 w-3 animate-spin" />}
          Save
        </Button>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/* ─── Main detail component ──────────────────────────────────────────────── */

export function ApplicationDetail({ id }: ApplicationDetailProps) {
  const router = useRouter();
  const mounted = useMounted();
  const {
    applications,
    ensureApplication,
    updateApplication,
    deleteApplication,
    getReminders,
    getInterviews,
    refreshReminders,
    refreshInterviews,
  } = useApplicationStore();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setFetchAttempted(false));
    let cancelled = false;
    void ensureApplication(id).finally(() => {
      if (!cancelled) setFetchAttempted(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id, ensureApplication]);

  useEffect(() => {
    void refreshReminders();
    void refreshInterviews();
  }, [refreshReminders, refreshInterviews]);

  const application = applications.find((a) => a.id === id) ?? null;

  if (!mounted) return <ApplicationDetailSkeleton />;

  if (!fetchAttempted && !application) {
    return <ApplicationDetailSkeleton />;
  }

  if (fetchAttempted && !application) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium text-foreground">Application not found</p>
        <p className="mt-1 text-xs text-muted-foreground">This application may have been deleted.</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/dashboard/applications">Back to applications</Link>
        </Button>
      </div>
    );
  }

  if (!application) {
    return <ApplicationDetailSkeleton />;
  }

  const reminders = getReminders(id);
  const interviews = getInterviews(id);

  const salaryRange =
    application.salaryMin || application.salaryMax
      ? [
          application.salaryMin
            ? `${application.currency ?? ""} ${application.salaryMin.toLocaleString()}`
            : null,
          application.salaryMax ? `${application.salaryMax.toLocaleString()}` : null,
        ]
          .filter(Boolean)
          .join(" – ")
      : null;

  async function handleStatusChange(newStatus: string) {
    try {
      await updateApplication(id, { status: newStatus as ApplicationStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  async function handleDelete() {
    try {
      await deleteApplication(id);
      toast.success("Application deleted");
      router.push("/dashboard/applications");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground" asChild>
          <Link href="/dashboard/applications">
            <ArrowLeft className="h-3.5 w-3.5" />
            Applications
          </Link>
        </Button>
        <span className="text-muted-foreground/40">/</span>
        <span className="truncate text-[13px] font-medium text-foreground max-w-[200px]">
          {application.jobTitle}
        </span>
      </div>

      {/* Header card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[15px] font-bold text-primary">
                {application.company.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">{application.jobTitle}</h2>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">{application.company}</span>
                  {application.location && (
                    <>
                      <span className="text-muted-foreground/30">·</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />{application.location}
                      </span>
                    </>
                  )}
                  {application.jobUrl && (
                    <a href={application.jobUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" />View posting
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" className="h-8" asChild>
                <Link href={`/dashboard/applications/${id}/edit`}>
                  <Pencil className="h-3.5 w-3.5" />Edit
                </Link>
              </Button>
              {!showDeleteConfirm ? (
                <Button variant="outline" size="sm"
                  className="h-8 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                  onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 className="h-3.5 w-3.5" />Delete
                </Button>
              ) : (
                <div className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-1.5">
                  <span className="text-xs font-medium text-destructive">Delete?</span>
                  <button onClick={handleDelete} className="text-xs font-semibold text-destructive hover:underline">Yes</button>
                  <span className="text-muted-foreground/40">·</span>
                  <button onClick={() => setShowDeleteConfirm(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                </div>
              )}
            </div>
          </div>

          {/* Status selector */}
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
            <span className="text-[12px] font-medium text-muted-foreground">Status</span>
            <Select value={application.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-8 w-48 min-w-0 max-w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {APPLICATION_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    <StatusBadge status={s} size="sm" />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-[11px] text-muted-foreground">
              Updated {format(parseISO(application.updatedAt), "MMM d, yyyy")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main content: 3/5 + 2/5 */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Left, notes + timeline */}
        <div className="space-y-5 lg:col-span-3">
          {application.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileTextIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[13px] leading-relaxed text-foreground whitespace-pre-wrap">
                  {application.notes}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <TimelineSection applicationId={id} />
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4 lg:col-span-2">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-5 pb-4">
              <DetailRow icon={Globe} label="Work mode" value={application.workMode} />
              <DetailRow icon={MapPin} label="Location" value={application.location} />
              <DetailRow icon={DollarSign} label="Salary" value={salaryRange} />
              <DetailRow icon={Tag} label="Source" value={application.source} />
              <DetailRow
                icon={CalendarDays}
                label="Deadline"
                value={application.deadline ? format(parseISO(application.deadline), "MMM d, yyyy") : null}
              />
              <DetailRow
                icon={CalendarDays}
                label="Added"
                value={format(parseISO(application.createdAt), "MMM d, yyyy")}
              />
            </CardContent>
          </Card>

          {/* Reminders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-muted-foreground" />Reminders
                </CardTitle>
                <button
                  onClick={() => { setShowReminderForm((v) => !v); setShowInterviewForm(false); }}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showReminderForm
                    ? <><X className="h-3 w-3" /> Cancel</>
                    : <><Plus className="h-3 w-3" /> Add</>}
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-5 pb-4">
              {showReminderForm && (
                <InlineReminderForm
                  applicationId={id}
                  applicationName={application.company}
                  onClose={() => setShowReminderForm(false)}
                />
              )}
              {reminders.length === 0 && !showReminderForm ? (
                <p className="py-3 text-center text-xs text-muted-foreground">No reminders yet</p>
              ) : (
                <ul className={cn("space-y-2", showReminderForm && "mt-3")}>
                  {reminders.map((r) => (
                    <li key={r.id} className="flex items-start gap-2">
                      <span className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full", r.completed ? "bg-border" : "bg-amber-500")} />
                      <div>
                        <p className={cn("text-[13px]", r.completed && "line-through text-muted-foreground")}>{r.title}</p>
                        <p className="text-[11px] text-muted-foreground">{format(parseISO(r.dueDate), "MMM d")}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Interviews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />Interviews
                </CardTitle>
                <button
                  onClick={() => { setShowInterviewForm((v) => !v); setShowReminderForm(false); }}
                  className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showInterviewForm
                    ? <><X className="h-3 w-3" /> Cancel</>
                    : <><Plus className="h-3 w-3" /> Add</>}
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-5 pb-4">
              {showInterviewForm && (
                <InlineInterviewForm
                  applicationId={id}
                  onClose={() => setShowInterviewForm(false)}
                />
              )}
              {interviews.length === 0 && !showInterviewForm ? (
                <p className="py-3 text-center text-xs text-muted-foreground">No interviews logged</p>
              ) : (
                <ul className={cn("space-y-2.5", showInterviewForm && "mt-3")}>
                  {interviews.map((iv) => (
                    <li key={iv.id} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <div>
                        <p className="text-[13px] font-medium">{iv.stage}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {iv.type}{iv.scheduledAt && ` · ${format(parseISO(iv.scheduledAt), "MMM d, h:mm a")}`}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}
