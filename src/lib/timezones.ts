/** Curated IANA timezones for settings pickers (not exhaustive). */
export const COMMON_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Toronto",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Warsaw",
  "Africa/Lagos",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

export function getDeviceTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export function formatTimezoneLabel(timezone: string): string {
  const normalized = timezone.trim();
  if (!normalized) return timezone;

  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: normalized,
      timeZoneName: "shortOffset",
    }).formatToParts(now);
    const offset =
      parts.find((part) => part.type === "timeZoneName")?.value ?? "";
    const city = normalized.split("/").pop()?.replace(/_/g, " ") ?? normalized;
    return offset ? `${city} (${offset})` : city;
  } catch {
    return normalized.replace(/_/g, " ");
  }
}

export function buildTimezoneOptions(current?: string | null): string[] {
  const device = getDeviceTimezone();
  const values = new Set<string>(COMMON_TIMEZONES);

  if (current?.trim()) {
    values.add(current.trim());
  }
  values.add(device);

  return Array.from(values).sort((a, b) =>
    formatTimezoneLabel(a).localeCompare(formatTimezoneLabel(b)),
  );
}
