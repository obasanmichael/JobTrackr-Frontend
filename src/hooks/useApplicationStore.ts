"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MOCK_TIMELINE_EVENTS,
  MOCK_REMINDERS,
  MOCK_INTERVIEWS,
} from "@/lib/mock-data";
import {
  createApplication as createApplicationApi,
  deleteApplication as deleteApplicationApi,
  getApplication as getApplicationApi,
  listApplications,
  updateApplication as updateApplicationApi,
} from "@/features/job-seeker/applications/api/applications-api";
import type {
  Application,
  TimelineEvent,
  Reminder,
  Interview,
  CreateApplicationPayload,
  UpdateApplicationPayload,
  CreateTimelineEventPayload,
} from "@/types";

const STORAGE_KEY = "jt_dev_store";

interface Store {
  applications: Application[];
  applicationsLoading: boolean;
  applicationsError: string | null;
  events: TimelineEvent[];
  reminders: Reminder[];
  interviews: Interview[];
}

function loadDevSlice(): Pick<Store, "events" | "reminders" | "interviews"> {
  if (typeof window === "undefined") {
    return {
      events: MOCK_TIMELINE_EVENTS,
      reminders: MOCK_REMINDERS,
      interviews: MOCK_INTERVIEWS,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        events: MOCK_TIMELINE_EVENTS,
        reminders: MOCK_REMINDERS,
        interviews: MOCK_INTERVIEWS,
      };
    }
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      events: parsed.events ?? MOCK_TIMELINE_EVENTS,
      reminders: parsed.reminders ?? MOCK_REMINDERS,
      interviews: parsed.interviews ?? MOCK_INTERVIEWS,
    };
  } catch {
    return {
      events: MOCK_TIMELINE_EVENTS,
      reminders: MOCK_REMINDERS,
      interviews: MOCK_INTERVIEWS,
    };
  }
}

function saveDevSlice(store: Store) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        events: store.events,
        reminders: store.reminders,
        interviews: store.interviews,
      })
    );
  } catch {
    /* ignore quota */
  }
}

function uuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

let _store: Store = {
  applications: [],
  applicationsLoading: false,
  applicationsError: null,
  ...loadDevSlice(),
};
const _listeners = new Set<() => void>();

function getStore() {
  return _store;
}

function setStore(next: Store) {
  _store = next;
  saveDevSlice(next);
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

  const refreshApplications = useCallback(async (search?: string) => {
    setStore({
      ...getStore(),
      applicationsLoading: true,
      applicationsError: null,
    });
    try {
      const applications = await listApplications(search);
      setStore({
        ...getStore(),
        applications,
        applicationsLoading: false,
        applicationsError: null,
      });
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
      const now = new Date().toISOString();
      const event: TimelineEvent = {
        id: `ev-${uuid()}`,
        applicationId: app.id,
        type: "Status Change",
        content: `Application created with status: ${app.status}`,
        createdAt: now,
      };
      const store = getStore();
      setStore({
        ...store,
        applications: [app, ...store.applications],
        events: [event, ...store.events],
      });
      return app;
    },
    []
  );

  const updateApplication = useCallback(
    async (
      id: string,
      payload: UpdateApplicationPayload
    ): Promise<Application | null> => {
      const store = getStore();
      const existing = store.applications.find((a) => a.id === id);
      if (!existing) return null;
      const updated = await updateApplicationApi(id, payload);
      const events = [...store.events];

      if (payload.status && payload.status !== existing.status) {
        events.unshift({
          id: `ev-${uuid()}`,
          applicationId: id,
          type: "Status Change",
          content: `Status changed from ${existing.status} → ${payload.status}`,
          createdAt: new Date().toISOString(),
        });
      }

      setStore({
        ...store,
        applications: store.applications.map((a) => (a.id === id ? updated : a)),
        events,
      });
      return updated;
    },
    []
  );

  const deleteApplication = useCallback(async (id: string) => {
    await deleteApplicationApi(id);
    const store = getStore();
    setStore({
      ...store,
      applications: store.applications.filter((a) => a.id !== id),
      events: store.events.filter((e) => e.applicationId !== id),
      reminders: store.reminders.filter((r) => r.applicationId !== id),
      interviews: store.interviews.filter((i) => i.applicationId !== id),
    });
  }, []);

  const getEvents = useCallback(
    (applicationId: string) =>
      getStore()
        .events.filter((e) => e.applicationId === applicationId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    []
  );

  const addEvent = useCallback(
    (applicationId: string, payload: CreateTimelineEventPayload): TimelineEvent => {
      const now = new Date().toISOString();
      const event: TimelineEvent = {
        id: `ev-${uuid()}`,
        applicationId,
        type: payload.type,
        content: payload.content,
        createdAt: now,
      };
      const store = getStore();
      setStore({ ...store, events: [event, ...store.events] });
      return event;
    },
    []
  );

  const getReminders = useCallback(
    (applicationId?: string) => {
      const store = getStore();
      return applicationId
        ? store.reminders.filter((r) => r.applicationId === applicationId)
        : store.reminders;
    },
    []
  );

  const createReminder = useCallback(
    (
      payload: Omit<
        Reminder,
        "id" | "userId" | "completed" | "createdAt" | "updatedAt"
      >
    ): Reminder => {
      const now = new Date().toISOString();
      const reminder: Reminder = {
        ...payload,
        id: `rem-${uuid()}`,
        userId: "dev",
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      const store = getStore();
      setStore({ ...store, reminders: [reminder, ...store.reminders] });
      return reminder;
    },
    []
  );

  const updateReminder = useCallback(
    (
      id: string,
      payload: Partial<
        Pick<Reminder, "title" | "description" | "dueDate" | "completed">
      >
    ) => {
      const store = getStore();
      setStore({
        ...store,
        reminders: store.reminders.map((r) =>
          r.id === id
            ? { ...r, ...payload, updatedAt: new Date().toISOString() }
            : r
        ),
      });
    },
    []
  );

  const toggleReminder = useCallback((id: string) => {
    const store = getStore();
    setStore({
      ...store,
      reminders: store.reminders.map((r) =>
        r.id === id
          ? { ...r, completed: !r.completed, updatedAt: new Date().toISOString() }
          : r
      ),
    });
  }, []);

  const deleteReminder = useCallback((id: string) => {
    const store = getStore();
    setStore({
      ...store,
      reminders: store.reminders.filter((r) => r.id !== id),
    });
  }, []);

  const getInterviews = useCallback(
    (applicationId?: string) => {
      const store = getStore();
      return applicationId
        ? store.interviews.filter((i) => i.applicationId === applicationId)
        : store.interviews;
    },
    []
  );

  const createInterview = useCallback(
    (
      payload: Omit<Interview, "id" | "userId" | "createdAt" | "updatedAt">
    ): Interview => {
      const now = new Date().toISOString();
      const interview: Interview = {
        ...payload,
        id: `int-${uuid()}`,
        userId: "dev",
        createdAt: now,
        updatedAt: now,
      };
      const store = getStore();
      setStore({ ...store, interviews: [interview, ...store.interviews] });
      return interview;
    },
    []
  );

  const updateInterview = useCallback(
    (id: string, payload: Partial<Interview>) => {
      const store = getStore();
      setStore({
        ...store,
        interviews: store.interviews.map((i) =>
          i.id === id
            ? { ...i, ...payload, updatedAt: new Date().toISOString() }
            : i
        ),
      });
    },
    []
  );

  const deleteInterview = useCallback((id: string) => {
    const store = getStore();
    setStore({
      ...store,
      interviews: store.interviews.filter((i) => i.id !== id),
    });
  }, []);

  const resetStore = useCallback(() => {
    setStore({
      applications: [],
      applicationsLoading: false,
      applicationsError: null,
      events: MOCK_TIMELINE_EVENTS,
      reminders: MOCK_REMINDERS,
      interviews: MOCK_INTERVIEWS,
    });
  }, []);

  return {
    applications: getStore().applications,
    applicationsLoading: getStore().applicationsLoading,
    applicationsError: getStore().applicationsError,
    refreshApplications,
    ensureApplication,
    getApplications,
    getApplication,
    createApplication,
    updateApplication,
    deleteApplication,
    getEvents,
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
