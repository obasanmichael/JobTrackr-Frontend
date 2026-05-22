import { describe, expect, it } from "vitest";
import { buildScheduleEvents } from "./build-schedule-events";

describe("buildScheduleEvents", () => {
  it("maps interviews and reminders with application labels", () => {
    const events = buildScheduleEvents({
      applications: [
        {
          id: "app-1",
          userId: "u1",
          jobTitle: "Engineer",
          company: "Acme",
          status: "Interview",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      interviews: [
        {
          id: "iv-1",
          userId: "u1",
          applicationId: "app-1",
          stage: "Technical Interview",
          type: "Video",
          scheduledAt: "2026-05-21T14:00:00.000Z",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      reminders: [
        {
          id: "rem-1",
          userId: "u1",
          applicationId: "app-1",
          title: "Follow up",
          dueDate: "2026-05-22T09:00:00.000Z",
          completed: false,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    expect(events).toHaveLength(2);
    expect(events[0]?.kind).toBe("interview");
    expect(events[0]?.title).toContain("Acme");
    expect(events[1]?.kind).toBe("reminder");
    expect(events[1]?.title).toBe("Follow up");
  });

  it("skips completed reminders by default", () => {
    const events = buildScheduleEvents({
      applications: [],
      interviews: [],
      reminders: [
        {
          id: "rem-1",
          userId: "u1",
          applicationId: "app-1",
          title: "Done",
          dueDate: "2026-05-22T09:00:00.000Z",
          completed: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    expect(events).toHaveLength(0);
  });
});
