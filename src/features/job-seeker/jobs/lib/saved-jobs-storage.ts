const STORAGE_KEY = "jobtrackr:saved-job-ids";

function readIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

function writeIds(ids: string[]): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function getSavedJobIds(): string[] {
  return readIds();
}

export function isJobSaved(jobId: string): boolean {
  return readIds().includes(jobId);
}

/** Toggle bookmark; returns true when saved after toggle. */
export function toggleSavedJobId(jobId: string): boolean {
  const ids = readIds();
  if (ids.includes(jobId)) {
    writeIds(ids.filter((id) => id !== jobId));
    return false;
  }
  writeIds([jobId, ...ids]);
  return true;
}
