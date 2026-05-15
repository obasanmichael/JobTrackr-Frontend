"use client";

import { useState, useEffect, useCallback } from "react";
import {
  createApplication as createApplicationApi,
  deleteApplication as deleteApplicationApi,
  getApplication as getApplicationApi,
  listApplications,
  updateApplication as updateApplicationApi,
} from "@/features/job-seeker/applications/api/applications-api";
import {
  createApplicationEvent,
  listApplicationEvents,
} from "@/features/job-seeker/applications/api/application-events-api";
import {
  createTimelinePayloadToApi,
  eventFromApi,
} from "@/features/job-seeker/applications/lib/timeline-mappers";
import {
  listReminders as listRemindersApi,
  createReminder as createReminderApi,
  updateReminder as updateReminderApi,
  deleteReminder as deleteReminderApi,
} from "@/features/job-seeker/reminders/api/reminders-api";
import {
  listInterviews as listInterviewsApi,
  createInterview as createInterviewApi,
  updateInterview as updateInterviewApi,
  deleteInterview as deleteInterviewApi,
} from "@/features/job-seeker/interviews/api/interviews-api";
import {
  interviewCreatePayloadToApi,
  interviewUpdatePayloadToApi,
} from "@/features/job-seeker/interviews/lib/interview-mappers";
import type {
  Application,
  TimelineEvent,
  Reminder,
  Interview,
  CreateApplicationPayload,
  UpdateApplicationPayload,
  CreateTimelineEventPayload,
} from "@/types";
import type { InterviewStage, InterviewType } from "@/lib/constants";

interface Store {
  applications: Application[];
  applicationsLoading: boolean;
  applicationsError: string | null;
  eventsByApplicationId: Record<string, TimelineEvent[]>;
  eventsLoadingByApplicationId: Record<string, boolean>;
  reminders: Reminder[];
  remindersLoading: boolean;
  interviews: Interview[];
  interviewsLoading: boolean;
}

let _store: Store = {
  applications: [],
  applicationsLoading: false,
  applicationsError: null,
  eventsByApplicationId: {},
  eventsLoadingByApplicationId: {},
  reminders: [],
  remindersLoading: false,
  interviews: [],
  interviewsLoading: false,
};

const _listeners = new Set<() => void>();

function getStore() {
  return _store;
}

function setStore(next: Store) {
  _store = next;
  _listeners.forEach((fn) => fn());
}

export function useApplicationStore() {
  const [, rerender] = useState(0);

  useEffect(() => {
    const trigger = () => rerender((n) => n + 1);
    _listeners.add(trigger);
    return () => {
      _listeners.delete(trigger);
    };
  }, []);

  /* ── Timeline events ───────────────────────────────────────────────────── */

  const refreshEvents = useCallback(async (applicationId: string) => {
    const store = getStore();
    setStore({
      ...store,
      eventsLoadingByApplicationId: { ...store.eventsLoadingByApplicationId, [applicationId]: true },
    });
    try {
      const raw = await listApplicationEvents(applicationId);
      const mapped = raw.map(eventFromApi);
      const next = getStore();
      setStore({
        ...next,
        eventsByApplicationId: { ...next.eventsByApplicationId, [applicationId]: mapped },
        eventsLoadingByApplicationId: { ...next.eventsLoadingByApplicationId, [applicationId]: false },
      });
    } catch {
      const next = getStore();
      setStore({
        ...next,
        eventsLoadingByApplicationId: { ...next.eventsLoadingByApplicationId, [applicationId]: false },
      });
    }
  }, []);

  const getEvents = useCallback((applicationId: string) => {
    const list = getStore().eventsByApplicationId[applicationId] ?? [];
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, []);

  const getEventsLoading = useCallback(
    (applicationId: string) => Boolean(getStore().eventsLoadingByApplicationId[applicationId]),
    []
  );

  const addEvent = useCallback(
    async (applicationId: string, payload: CreateTimelineEventPayload): Promise<TimelineEvent> => {
      const body = createTimelinePayloadToApi(payload);
      const raw = await createApplicationEvent(applicationId, body);
      const event = eventFromApi(raw);
      await refreshEvents(applicationId);
      return event;
    },
    [refreshEvents]
  );

  /* ── Applications ──────────────────────────────────────────────────────── */

  const refreshApplications = useCallback(async (search?: string) => {
    setStore({ ...getStore(), applicationsLoading: true, applicationsError: null });
    try {
      const applications = await listApplications(search);
      setStore({ ...getStore(), applications, applicationsLoading: false, applicationsError: null });
    } catch {
      setStore({
        ...getStore(),
        applicationsLoading: false,
        applicationsError: "Could not load applications. Please try again.",
      });
    }
  }, []);

  const getApplications = useCallback(() => getStore().applications, []);

  const getApplication = useCallback(
    (id: string) => getStore().applications.find((a) => a.id === id) ?? null,
    []
  );

  const ensureApplication = useCallback(async (id: string) => {
    const existing = getStore().applications.find((a) => a.id === id);
    if (existing) return existing;
    try {
      const app = await getApplicationApi(id);
      const store = getStore();
      setStore({
        ...store,
        applications: [app, ...store.applications.filter((a) => a.id !== id)],
      });
      return app;
    } catch {
      return null;
    }
  }, []);

  const createApplication = useCallback(
    async (payload: CreateApplicationPayload): Promise<Application> => {
      const app = await createApplicationApi(payload);
      try {
        await createApplicationEvent(app.id, {
          type: "GENERAL_UPDATE",
          title: "Application added",
          description: `Now tracking ${app.jobTitle} at ${app.company} (${app.status}).`.slice(0, 2000),
        });
      } catch {
        /* timeline seed is best-effort */
      }
      await refreshEvents(app.id);
      const store = getStore();
      setStore({ ...store, applications: [app, ...store.applications] });
      return app;
    },
    [refreshEvents]
  );

  const updateApplication = useCallback(
    async (id: string, payload: UpdateApplicationPayload): Promise<Application | null> => {
      const store = getStore();
      const existing = store.applications.find((a) => a.id === id);
      if (!existing) return null;
      const updated = await updateApplicationApi(id, payload);
      setStore({ ...store, applications: store.applications.map((a) => (a.id === id ? updated : a)) });
      if (payload.status && payload.status !== existing.status) {
        await refreshEvents(id);
      }
      return updated;
    },
    [refreshEvents]
  );

  const deleteApplication = useCallback(async (id: string) => {
    await deleteApplicationApi(id);
    const store = getStore();
    const eventsByApplicationId = { ...store.eventsByApplicationId };
    delete eventsByApplicationId[id];
    const eventsLoadingByApplicationId = { ...store.eventsLoadingByApplicationId };
    delete eventsLoadingByApplicationId[id];
    setStore({
      ...store,
      applications: store.applications.filter((a) => a.id !== id),
      eventsByApplicationId,
      eventsLoadingByApplicationId,
      reminders: store.reminders.filter((r) => r.applicationId !== id),
      interviews: store.interviews.filter((iv) => iv.applicationId !== id),
    });
  }, []);

  /* ── Reminders ─────────────────────────────────────────────────────────── */

  const refreshReminders = useCallback(async () => {
    setStore({ ...getStore(), remindersLoading: true });
    try {
      const reminders = await listRemindersApi();
      setStore({ ...getStore(), reminders, remindersLoading: false });
    } catch {
      setStore({ ...getStore(), remindersLoading: false });
    }
  }, []);

  /** Returns reminders enriched with application data from the local app list. */
  const getReminders = useCallback((applicationId?: string) => {
    const store = getStore();
    const list = applicationId
      ? store.reminders.filter((r) => r.applicationId === applicationId)
      : store.reminders;

    return list.map((r) => {
      const app = r.applicationId
        ? store.applications.find((a) => a.id === r.applicationId)
        : undefined;
      return {
        ...r,
        application: app
          ? { id: app.id, jobTitle: app.jobTitle, company: app.company }
          : r.application,
      };
    });
  }, []);

  const createReminder = useCallback(
    async (payload: {
      title: string;
      description?: string;
      dueDate: string;
      applicationId: string;
    }): Promise<Reminder> => {
      const reminder = await createReminderApi({
        applicationId: payload.applicationId,
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate,
      });
      const store = getStore();
      setStore({ ...store, reminders: [reminder, ...store.reminders] });
      return reminder;
    },
    []
  );

  const updateReminder = useCallback(
    async (
      id: string,
      payload: { title?: string; description?: string; dueDate?: string; completed?: boolean }
    ): Promise<Reminder> => {
      const updated = await updateReminderApi(id, {
        title: payload.title,
        description: payload.description,
        dueDate: payload.dueDate,
        isCompleted: payload.completed,
      });
      const store = getStore();
      setStore({
        ...store,
        reminders: store.reminders.map((r) => (r.id === id ? updated : r)),
      });
      return updated;
    },
    []
  );

  const toggleReminder = useCallback(async (id: string): Promise<void> => {
    const existing = getStore().reminders.find((r) => r.id === id);
    if (!existing) return;
    const updated = await updateReminderApi(id, { isCompleted: !existing.completed });
    const store = getStore();
    setStore({
      ...store,
      reminders: store.reminders.map((r) => (r.id === id ? updated : r)),
    });
  }, []);

  const deleteReminder = useCallback(async (id: string): Promise<void> => {
    await deleteReminderApi(id);
    const store = getStore();
    setStore({ ...store, reminders: store.reminders.filter((r) => r.id !== id) });
  }, []);

  /* ── Interviews ────────────────────────────────────────────────────────── */

  const refreshInterviews = useCallback(async () => {
    setStore({ ...getStore(), interviewsLoading: true });
    try {
      const interviews = await listInterviewsApi();
      setStore({ ...getStore(), interviews, interviewsLoading: false });
    } catch {
      setStore({ ...getStore(), interviewsLoading: false });
    }
  }, []);

  /** Returns interviews enriched with application data from the local app list. */
  const getInterviews = useCallback((applicationId?: string) => {
    const store = getStore();
    const list = applicationId
      ? store.interviews.filter((iv) => iv.applicationId === applicationId)
      : store.interviews;

    return list.map((iv) => {
      const app = store.applications.find((a) => a.id === iv.applicationId);
      return {
        ...iv,
        application: app
          ? { id: app.id, jobTitle: app.jobTitle, company: app.company }
          : iv.application,
      };
    });
  }, []);

  const createInterview = useCallback(
    async (payload: {
      applicationId: string;
      stage: InterviewStage;
      type: InterviewType;
      scheduledAt: string;
      location?: string;
      notes?: string;
      outcome?: string;
    }): Promise<Interview> => {
      const body = interviewCreatePayloadToApi(payload);
      const interview = await createInterviewApi(body);
      const store = getStore();
      setStore({ ...store, interviews: [interview, ...store.interviews] });
      return interview;
    },
    []
  );

  const updateInterview = useCallback(
    async (
      id: string,
      payload: {
        stage?: InterviewStage;
        type?: InterviewType;
        scheduledAt?: string;
        location?: string;
        notes?: string;
        outcome?: string;
      }
    ): Promise<Interview> => {
      const body = interviewUpdatePayloadToApi(payload);
      const updated = await updateInterviewApi(id, body);
      const store = getStore();
      setStore({
        ...store,
        interviews: store.interviews.map((iv) => (iv.id === id ? updated : iv)),
      });
      return updated;
    },
    []
  );

  const deleteInterview = useCallback(async (id: string): Promise<void> => {
    await deleteInterviewApi(id);
    const store = getStore();
    setStore({ ...store, interviews: store.interviews.filter((iv) => iv.id !== id) });
  }, []);

  /* ── Reset ─────────────────────────────────────────────────────────────── */

  const resetStore = useCallback(() => {
    setStore({
      applications: [],
      applicationsLoading: false,
      applicationsError: null,
      eventsByApplicationId: {},
      eventsLoadingByApplicationId: {},
      reminders: [],
      remindersLoading: false,
      interviews: [],
      interviewsLoading: false,
    });
  }, []);

  return {
    applications: getStore().applications,
    applicationsLoading: getStore().applicationsLoading,
    applicationsError: getStore().applicationsError,
    remindersLoading: getStore().remindersLoading,
    interviewsLoading: getStore().interviewsLoading,
    refreshApplications,
    refreshReminders,
    refreshInterviews,
    refreshEvents,
    ensureApplication,
    getApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication,
    getEvents,
    getEventsLoading,
    addEvent,
    getReminders,
    createReminder,
    toggleReminder,
    updateReminder,
    deleteReminder,
    getInterviews,
    createInterview,
    updateInterview,
    deleteInterview,
    resetStore,
  };
}
