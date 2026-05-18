import { api } from "@/shared/lib/http-client";
import type { JobSearchResult } from "@/types";
import { type JobSearchResponseApi, jobSearchFromApi } from "../lib/job-mappers";

export interface JobSearchParams {
  q?: string;
  location?: string;
  workMode?: string;
  page?: number;
  limit?: number;
}

export async function searchJobs(params: JobSearchParams = {}): Promise<JobSearchResult> {
  const { data } = await api.get<JobSearchResponseApi>("/jobs", {
    params: {
      ...params,
    },
  });
  return jobSearchFromApi(data);
}
