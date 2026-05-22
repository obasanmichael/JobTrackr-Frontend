import {
  deleteSavedJob,
  listSavedJobs,
  saveJob,
} from "@/features/job-seeker/jobs/api/saved-jobs-api";

/** Legacy localStorage key, see `saved-jobs-migration.ts`. */
export const LEGACY_SAVED_JOB_IDS_KEY = "jobtrackr:saved-job-ids";

const MIGRATION_FLAG_KEY = "jobtrackr:saved-jobs-migrated-to-api-v1";

function readLegacyIds(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = localStorage.getItem(LEGACY_SAVED_JOB_IDS_KEY);
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

/**
 * One-time migration: POST each legacy id to `/saved-jobs`, then clear legacy storage.
 * Safe to call on dashboard jobs mount; ignores per-id failures (e.g. removed listings).
 */
export async function migrateLegacySavedJobIdsOnce(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }
  if (localStorage.getItem(MIGRATION_FLAG_KEY)) {
    return;
  }
  const ids = readLegacyIds();
  if (ids.length === 0) {
    localStorage.setItem(MIGRATION_FLAG_KEY, "1");
    return;
  }
  await Promise.all(
    ids.map(async (externalJobId) => {
      try {
        await saveJob(externalJobId);
      } catch {
        /* stale id or network, skip */
      }
    }),
  );
  localStorage.removeItem(LEGACY_SAVED_JOB_IDS_KEY);
  localStorage.setItem(MIGRATION_FLAG_KEY, "1");
}

/** Query key for TanStack, bookmarks used for board + detail saved state. */
export function savedJobsBookmarksQueryKey(): readonly string[] {
  return ["saved-jobs", "bookmarks", "v1"] as const;
}

export async function fetchSavedJobsBookmarks() {
  return listSavedJobs({
    page: 1,
    limit: 500,
    includeConverted: true,
  });
}

export type SavedBookmarkRow = Awaited<ReturnType<typeof fetchSavedJobsBookmarks>>["items"][number];

/** Lookup bookmark row by canonical job listing id (`ExternalJob.id`). */
export function findBookmarkForJobId(
  items: SavedBookmarkRow[],
  jobListingId: string,
): SavedBookmarkRow | undefined {
  return items.find((row) => row.jobListingId === jobListingId);
}

/** True when a non-dismissed bookmark exists (saved or converted). */
export function isBookmarkedRow(row: SavedBookmarkRow | undefined): boolean {
  if (!row) {
    return false;
  }
  return row.status !== "DISMISSED";
}

export async function toggleSavedJobBookmark(
  jobListingId: string,
  existingRow: SavedBookmarkRow | undefined,
): Promise<void> {
  if (existingRow && existingRow.status !== "DISMISSED") {
    await deleteSavedJob(existingRow.id);
    return;
  }
  await saveJob(jobListingId);
}
