import { describe, expect, it } from "vitest";
import {
  datetimeLocalInputToIso,
  formatIsoDateTimeLabel,
  isoToDatetimeLocalInput,
} from "./datetime-local";

describe("datetime-local helpers", () => {
  it("converts UTC ISO to local datetime-local input", () => {
    const utc = "2026-05-25T12:05:00.000Z";
    const localInput = isoToDatetimeLocalInput(utc);
    const roundTrip = datetimeLocalInputToIso(localInput);
    expect(new Date(roundTrip).toISOString()).toBe(utc);
  });

  it("formats list labels from the same instant as datetime-local input", () => {
    const utc = "2026-05-25T12:05:00.000Z";
    const input = isoToDatetimeLocalInput(utc);
    const label = formatIsoDateTimeLabel(utc, "yyyy-MM-dd'T'HH:mm");
    expect(label).toBe(input);
  });

  it("does not treat UTC hour digits as local wall time (slice bug)", () => {
    const utc = "2026-05-25T14:05:00.000Z";
    const input = isoToDatetimeLocalInput(utc);
    expect(input).not.toBe("2026-05-25T14:05");
    expect(formatIsoDateTimeLabel(utc, "h:mm a")).toBe(
      formatIsoDateTimeLabel(datetimeLocalInputToIso(input), "h:mm a"),
    );
  });
});
