"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  GitCommitHorizontal,
  MessageSquare,
  Phone,
  CalendarCheck,
  Bell,
  FileText,
  Plus,
  Loader2,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { TIMELINE_EVENT_TYPES } from "@/lib/constants";
import type { TimelineEventType } from "@/lib/constants";
import type { TimelineEvent } from "@/types";

const ICON_MAP: Record<string, React.ElementType> = {
  "Status Change": GitCommitHorizontal,
  "Note": MessageSquare,
  "Recruiter Update": Phone,
  "Interview Update": CalendarCheck,
  "Reminder Created": Bell,
  "General Update": FileText,
};

const COLOR_MAP: Record<string, string> = {
  "Status Change": "bg-primary/10 text-primary dark:bg-primary/20",
  "Note": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  "Recruiter Update": "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
  "Interview Update": "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  "Reminder Created": "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  "General Update": "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
};

const addNoteSchema = z.object({
  type: z.enum(TIMELINE_EVENT_TYPES),
  content: z.string().min(1, "Note content is required"),
});
type AddNoteForm = z.infer<typeof addNoteSchema>;

interface TimelineSectionProps {
  applicationId: string;
}

export function TimelineSection({ applicationId }: TimelineSectionProps) {
  const { getEvents, addEvent } = useApplicationStore();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const events = getEvents(applicationId);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AddNoteForm>({
    resolver: zodResolver(addNoteSchema),
    defaultValues: { type: "Note" },
  });

  async function onSubmit(data: AddNoteForm) {
    setIsSubmitting(true);
    try {
      addEvent(applicationId, { type: data.type, content: data.content });
      reset({ type: "Note", content: "" });
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-foreground">Timeline</h3>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-xs"
          onClick={() => setShowForm((v) => !v)}
        >
          <Plus className="h-3 w-3" />
          Add note
        </Button>
      </div>

      {/* Add note form */}
      {showForm && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-xl border border-border bg-muted/30 p-4 space-y-3"
        >
          <Select
            // eslint-disable-next-line react-hooks/incompatible-library
            value={watch("type")}
            onValueChange={(v) => setValue("type", v as TimelineEventType)}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMELINE_EVENT_TYPES.filter((t) => t !== "Status Change").map((t) => (
                <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="What happened? Add any notes, updates, or observations…"
            rows={3}
            className="text-[13px]"
            {...register("content")}
          />
          {errors.content && (
            <p className="text-xs text-destructive">{errors.content.message}</p>
          )}

          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save note
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setShowForm(false); reset(); }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Events list */}
      {events.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No timeline events yet.
        </p>
      ) : (
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-5 bottom-1 w-px bg-border" />

          <ul className="space-y-1">
            {events.map((event) => (
              <TimelineItem key={event.id} event={event} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function TimelineItem({ event }: { event: TimelineEvent }) {
  const Icon = ICON_MAP[event.type] ?? FileText;
  const colorClass = COLOR_MAP[event.type] ?? COLOR_MAP["General Update"];

  return (
    <li className="relative flex gap-3 pb-4">
      {/* Icon dot */}
      <div
        className={cn(
          "relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full",
          colorClass
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {event.type}
            </span>
            <p className="mt-0.5 text-[13px] text-foreground leading-relaxed">
              {event.content}
            </p>
          </div>
          <time className="shrink-0 text-[11px] text-muted-foreground whitespace-nowrap">
            {format(parseISO(event.createdAt), "MMM d, h:mm a")}
          </time>
        </div>
      </div>
    </li>
  );
}
