import { api } from "@/shared/lib/http-client";
import type { JobListingApiRecord } from "@/features/job-seeker/jobs/lib/job-mappers";
import type { ApplicationApiRecord } from "@/features/job-seeker/applications/lib/application-mappers";

/** Mirrors backend `SavedJobResponseDto`. */
export type SavedJobApiRecord = {
  id: string;
  status: "SAVED" | "DISMISSED" | "CONVERTED_TO_APPLICATION";
  notes: string | null;
  convertedApplicationId: string | null;
  jobListingId: string;
  createdAt: string;
  updatedAt: string;
  job: JobListingApiRecord;
};

export type SavedJobsListResponseApi = {
  items: SavedJobApiRecord[];
  total: number;
  page: number;
  limit: number;
};

export type ConvertSavedJobResponseApi = {
  application: ApplicationApiRecord;
  savedJob: SavedJobApiRecord;
};

export type ListSavedJobsParams = {
  page?: number;
  limit?: number;
  includeConverted?: boolean;
  dismissedOnly?: boolean;
};

export async function listSavedJobs(
  params: ListSavedJobsParams = {},
): Promise<SavedJobsListResponseApi> {
  const { data } = await api.get<SavedJobsListResponseApi>("/saved-jobs", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      includeConverted: params.includeConverted ?? false,
      dismissedOnly: params.dismissedOnly ?? false,
    },
  });
  return data;
}

/** Upsert bookmark for `ExternalJob.id`. */
export async function saveJob(externalJobId: string): Promise<SavedJobApiRecord> {
  const { data } = await api.post<SavedJobApiRecord>("/saved-jobs", {
    externalJobId,
  });
  return data;
}

export async function deleteSavedJob(savedJobId: string): Promise<void> {
  await api.delete(`/saved-jobs/${savedJobId}`);
}

export async function convertSavedJob(
  savedJobId: string,
  body: { notesAppend?: string } = {},
): Promise<ConvertSavedJobResponseApi> {
  const { data } = await api.post<ConvertSavedJobResponseApi>(
    `/saved-jobs/${savedJobId}/convert-to-application`,
    body,
  );
  return data;
}
