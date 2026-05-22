"use client";

import {
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import {
  Bell,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useScheduleFeed } from "@/features/calendar/hooks/use-schedule-feed";
import type {
  ScheduleEvent,
  ScheduleViewMode,
} from "@/features/calendar/lib/schedule-event.types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/shared/lib/api-errors";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function eventsForDay(events: ScheduleEvent[], day: Date): ScheduleEvent[] {
  return events.filter((event) => isSameDay(event.start, day));
}

function EventPill({
  event,
  compact = false,
}: {
  event: ScheduleEvent;
  compact?: boolean;
}) {
  const isInterview = event.kind === "interview";

  return (
    <Link
      href={event.href}
      className={cn(
        "block truncate rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-opacity hover:opacity-80",
        isInterview
          ? "bg-amber-500/15 text-amber-900 dark:text-amber-200"
          : "bg-violet-500/15 text-violet-900 dark:text-violet-200",
        event.completed && "opacity-50 line-through",
      )}
      title={event.title}
    >
      {!compact && (
        <span className="mr-1 inline-block align-middle">
          {isInterview ? "●" : "○"}
        </span>
      )}
      {compact ? `${format(event.start, "h:mm a")} ` : null}
      {event.title}
    </Link>
  );
}

function DayAgenda({ events }: { events: ScheduleEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Nothing scheduled for this day.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {events.map((event) => (
        <li key={event.id}>
          <Link
            href={event.href}
            className="flex items-start gap-3 rounded-lg border border-border px-3 py-2.5 transition-colors hover:bg-accent/50"
          >
            <div
              className={cn(
                "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                event.kind === "interview"
                  ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                  : "bg-violet-500/15 text-violet-700 dark:text-violet-300",
              )}
            >
              {event.kind === "interview" ? (
                <CalendarCheck className="h-3.5 w-3.5" />
              ) : (
                <Bell className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {event.title}
              </p>
              {event.subtitle ? (
                <p className="truncate text-xs text-muted-foreground">{event.subtitle}</p>
              ) : null}
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {format(event.start, "h:mm a")}
                {event.kind === "interview" ? " · Interview" : " · Reminder"}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function JobTrackrScheduleCalendar() {
  const feedQuery = useScheduleFeed();
  const [viewMode, setViewMode] = useState<ScheduleViewMode>("month");
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const events = useMemo(() => feedQuery.data ?? [], [feedQuery.data]);

  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(cursorDate);
    const monthEnd = endOfMonth(cursorDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [cursorDate]);

  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(cursorDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(cursorDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [cursorDate]);

  const selectedDayEvents = useMemo(
    () => eventsForDay(events, selectedDate),
    [events, selectedDate],
  );

  const headerLabel =
    viewMode === "month"
      ? format(cursorDate, "MMMM yyyy")
      : `Week of ${format(startOfWeek(cursorDate, { weekStartsOn: 1 }), "MMM d, yyyy")}`;

  function goToday() {
    const today = new Date();
    setCursorDate(today);
    setSelectedDate(today);
  }

  function goPrevious() {
    setCursorDate((current) =>
      viewMode === "month" ? subMonths(current, 1) : subWeeks(current, 1),
    );
  }

  function goNext() {
    setCursorDate((current) =>
      viewMode === "month" ? addMonths(current, 1) : addWeeks(current, 1),
    );
  }

  if (feedQuery.isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-[280px] items-center justify-center py-10 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading your schedule…
        </CardContent>
      </Card>
    );
  }

  if (feedQuery.isError) {
    return (
      <Card>
        <CardContent className="py-8">
          <EmptyState
            icon={CalendarCheck}
            title="Could not load schedule"
            description={getApiErrorMessage(feedQuery.error)}
            action={
              <Button variant="secondary" size="sm" onClick={() => feedQuery.refetch()}>
                Retry
              </Button>
            }
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-4 pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Your schedule</CardTitle>
              <CardDescription>
                Interviews and reminders from your JobTrackr tracker.
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border p-1">
              {(["month", "week"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    viewMode === mode
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <Button type="button" variant="outline" size="icon" onClick={goPrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" size="icon" onClick={goNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={goToday}>
                Today
              </Button>
            </div>
            <p className="text-sm font-medium text-foreground">{headerLabel}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Interview
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
              Reminder
            </span>
          </div>
        </CardHeader>

        <CardContent>
          {viewMode === "month" ? (
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-7 border-b border-border pb-2">
                  {WEEKDAY_LABELS.map((label) => (
                    <div
                      key={label}
                      className="px-2 text-center text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 border-l border-border">
                  {monthDays.map((day) => {
                    const dayEvents = eventsForDay(events, day);
                    const isSelected = isSameDay(day, selectedDate);
                    const inCurrentMonth = isSameMonth(day, cursorDate);

                    return (
                      <button
                        key={day.toISOString()}
                        type="button"
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "min-h-[88px] border-b border-r border-border p-2 text-left transition-colors hover:bg-accent/40",
                          !inCurrentMonth && "bg-muted/20 text-muted-foreground",
                          isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/30",
                        )}
                      >
                        <span
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                            isToday(day) && "bg-primary text-primary-foreground",
                          )}
                        >
                          {format(day, "d")}
                        </span>
                        <div className="mt-1 space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <EventPill key={event.id} event={event} compact />
                          ))}
                          {dayEvents.length > 2 ? (
                            <p className="px-1 text-[10px] text-muted-foreground">
                              +{dayEvents.length - 2} more
                            </p>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-7">
              {weekDays.map((day) => {
                const dayEvents = eventsForDay(events, day);
                const isSelected = isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "rounded-xl border border-border p-3 text-left transition-colors hover:bg-accent/40",
                      isSelected && "border-primary/40 bg-primary/5",
                    )}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium uppercase text-muted-foreground">
                        {format(day, "EEE")}
                      </span>
                      <span
                        className={cn(
                          "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                          isToday(day) && "bg-primary text-primary-foreground",
                        )}
                      >
                        {format(day, "d")}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {dayEvents.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground">—</p>
                      ) : (
                        dayEvents.map((event) => (
                          <EventPill key={event.id} event={event} />
                        ))
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {events.length === 0 ? (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              No interviews or reminders yet. Add them from Applications or Reminders.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{format(selectedDate, "EEEE, MMMM d")}</CardTitle>
          <CardDescription>
            {selectedDayEvents.length}{" "}
            {selectedDayEvents.length === 1 ? "item" : "items"} scheduled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DayAgenda events={selectedDayEvents} />
        </CardContent>
      </Card>
    </div>
  );
}
