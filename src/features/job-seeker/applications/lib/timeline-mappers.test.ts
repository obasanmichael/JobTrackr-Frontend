import { describe, it, expect } from "vitest";
import {
  createTimelinePayloadToApi,
  eventFromApi,
  type ApplicationEventApiRecord,
} from "./timeline-mappers";

describe("eventFromApi", () => {
  it("maps API type and joins title with description for display", () => {
    const dto: ApplicationEventApiRecord = {
      id: "e1",
      userId: "u1",
      applicationId: "a1",
      type: "NOTE",
      title: "Short title",
      description: "Longer body",
      createdAt: "2026-05-01T12:00:00.000Z",
    };
    const ev = eventFromApi(dto);
    expect(ev.type).toBe("Note");
    expect(ev.content).toBe("Short title\n\nLonger body");
    expect(ev.applicationId).toBe("a1");
  });

  it("uses title only when description is absent", () => {
    const dto: ApplicationEventApiRecord = {
      id: "e2",
      userId: "u1",
      applicationId: "a1",
      type: "STATUS_CHANGE",
      title: "Status changed from Applied to Screening",
      description: null,
      createdAt: "2026-05-01T12:00:00.000Z",
    };
    const ev = eventFromApi(dto);
    expect(ev.type).toBe("Status Change");
    expect(ev.content).toBe("Status changed from Applied to Screening");
  });
});

describe("createTimelinePayloadToApi", () => {
  it("splits long content into title and description", () => {
    const long = "x".repeat(150);
    const body = createTimelinePayloadToApi({ type: "Note", content: long });
    expect(body.type).toBe("NOTE");
    expect(body.title).toHaveLength(120);
    expect(body.description).toHaveLength(30);
  });

  it("maps UI reminder type to API enum", () => {
    const body = createTimelinePayloadToApi({
      type: "Reminder Created",
      content: "Follow up",
    });
    expect(body).toEqual({
      type: "REMINDER_CREATED",
      title: "Follow up",
      description: undefined,
    });
  });
});
