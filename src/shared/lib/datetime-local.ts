import { format, isValid, parseISO } from "date-fns";

function parseIsoToDate(iso: string): Date | null {
  const trimmed = iso.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = parseISO(trimmed);
  if (isValid(parsed)) {
    return parsed;
  }
  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

/** Value for HTML `<input type="datetime-local" />` in the user's local timezone. */
export function isoToDatetimeLocalInput(iso: string): string {
  const date = parseIsoToDate(iso);
  if (!date) {
    return "";
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parse a datetime-local string (local wall time) to UTC ISO for the API. */
export function datetimeLocalInputToIso(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return new Date().toISOString();
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
}

/** Consistent display label for interview/reminder timestamps in lists. */
export function formatIsoDateTimeLabel(iso: string, pattern = "MMM d, yyyy · h:mm a"): string {
  const date = parseIsoToDate(iso);
  if (!date) {
    return iso;
  }
  return format(date, pattern);
}
