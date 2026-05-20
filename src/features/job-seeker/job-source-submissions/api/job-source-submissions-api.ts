import { api } from "@/shared/lib/http-client";
import { jobSourceSubmissionFromApi } from "../lib/job-source-submission-mappers";
import type {
  CreateJobSourceSubmissionPayload,
  JobSourceSubmission,
  JobSourceSubmissionApiRecord,
} from "../types";

export async function createJobSourceSubmission(
  payload: CreateJobSourceSubmissionPayload,
): Promise<JobSourceSubmission> {
  const { data } = await api.post<JobSourceSubmissionApiRecord>(
    "/job-source-submissions",
    payload,
  );
  return jobSourceSubmissionFromApi(data);
}
