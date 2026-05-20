import { api } from "@/shared/lib/http-client";
import type { JobBoardDetail, JobSearchResult, JobSingleMatch, MatchedJobsResult } from "@/types";
import {
  type JobDetailApiRecord,
  type JobMatchItemApi,
  type JobMatchListResponseApi,
  type JobSearchResponseApi,
  jobDetailFromApi,
  jobSearchFromApi,
  jobSingleMatchFromApi,
  matchedJobsFromApi,
} from "../lib/job-mappers";

export interface JobSearchParams {
  q?: string;
  location?: string;
  workMode?: string;
  experienceLevel?: string;
  salaryMin?: number;
  source?: string;
  postedWithin?: number;
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

export async function getJobById(id: string): Promise<JobBoardDetail> {
  const { data } = await api.get<JobDetailApiRecord>(`/jobs/${id}`);
  return jobDetailFromApi(data);
}

export async function getJobMatch(id: string): Promise<JobSingleMatch> {
  const { data } = await api.get<JobMatchItemApi>(`/jobs/${id}/match`);
  return jobSingleMatchFromApi(data);
}

export async function fetchMatchedJobs(): Promise<MatchedJobsResult> {
  const { data } = await api.get<JobMatchListResponseApi>("/matches");
  return matchedJobsFromApi(data);
}

export async function generateMatchedJobs(): Promise<MatchedJobsResult> {
  const { data } = await api.post<JobMatchListResponseApi>("/matches/generate");
  return matchedJobsFromApi(data);
}
