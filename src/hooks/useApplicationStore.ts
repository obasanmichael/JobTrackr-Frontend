"use client";

import { useState, useEffect, useCallback } from "react";
import { MOCK_REMINDERS, MOCK_INTERVIEWS } from "@/lib/mock-data";
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
  eventsByApplicationId: Record<string, TimelineEvent[]>;
  eventsLoadingByApplicationId: Record<string, boolean>;
  reminders: Reminder[];
  interviews: Interview[];
}

function loadDevSlice(): Pick<Store, "reminders" | "interviews"> {
  if (typeof window === "undefined") {
    return {
      reminders: MOCK_REMINDERS,
      interviews: MOCK_INTERVIEWS,
    };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        reminders: MOCK_REMINDERS,
        interviews: MOCK_INTERVIEWS,
      };
    }
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      reminders: parsed.reminders ?? MOCK_REMINDERS,
      interviews: parsed.interviews ?? MOCK_INTERVIEWS,
    };
  } catch {
    return {
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
  eventsByApplicationId: {},
  eventsLoadingByApplicationId: {},
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

  const refreshEvents = useCallback(async (applicationId: string) => {
    const store = getStore();
    setStore({
      ...store,
      eventsLoadingByApplicationId: {
        ...store.eventsLoadingByApplicationId,
        [applicationId]: true,
      },
    });
    try {
      const raw = await listApplicationEvents(applicationId);
      const mapped = raw.map(eventFromApi);
      const next = getStore();
      setStore({
        ...next,
        eventsByApplicationId: {
          ...next.eventsByApplicationId,
          [applicationId]: mapped,
        },
        eventsLoadingByApplicationId: {
          ...next.eventsLoadingByApplicationId,
          [applicationId]: false,
        },
      });
    } catch {
      const next = getStore();
      setStore({
        ...next,
        eventsLoadingByApplicationId: {
          ...next.eventsLoadingByApplicationId,
          [applicationId]: false,
        },
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
          description: `Now tracking ${app.jobTitle} at ${app.company} (${app.status}).`.slice(
            0,
            2000
          ),
        });
      } catch {
        /* timeline seed is best-effort */
      }
      await refreshEvents(app.id);
      const store = getStore();
      setStore({
        ...store,
        applications: [app, ...store.applications],
      });
      return app;
    },
    [refreshEvents]
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
      setStore({
        ...store,
        applications: store.applications.map((a) => (a.id === id ? updated : a)),
      });
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
      interviews: store.interviews.filter((i) => i.applicationId !== id),
    });
  }, []);

  const getEvents = useCallback((applicationId: string) => {
    const list = getStore().eventsByApplicationId[applicationId] ?? [];
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, []);

  const getEventsLoading = useCallback(
    (applicationId: string) =>
      Boolean(getStore().eventsLoadingByApplicationId[applicationId]),
    []
  );

  const addEvent = useCallback(
    async (
      applicationId: string,
      payload: CreateTimelineEventPayload
    ): Promise<TimelineEvent> => {
      const body = createTimelinePayloadToApi(payload);
      const raw = await createApplicationEvent(applicationId, body);
      const event = eventFromApi(raw);
      await refreshEvents(applicationId);
      return event;
    },
    [refreshEvents]
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
      eventsByApplicationId: {},
      eventsLoadingByApplicationId: {},
      reminders: MOCK_REMINDERS,
      interviews: MOCK_INTERVIEWS,
    });
  }, []);

  return {
    applications: getStore().applications,
    applicationsLoading: getStore().applicationsLoading,
    applicationsError: getStore().applicationsError,
    refreshApplications,
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
