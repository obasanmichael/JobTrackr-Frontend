import { api } from "@/shared/lib/http-client";
import type {
  CreateInterviewBody,
  InterviewApiRecord,
  UpdateInterviewBody,
} from "../lib/interview-mappers";
import { interviewFromApi } from "../lib/interview-mappers";
import type { Interview } from "@/types";

export async function listInterviews(): Promise<Interview[]> {
  const { data } = await api.get<InterviewApiRecord[]>("/interviews");
  return data.map(interviewFromApi);
}

export async function createInterview(
  body: CreateInterviewBody
): Promise<Interview> {
  const { data } = await api.post<InterviewApiRecord>("/interviews", body);
  return interviewFromApi(data);
}

export async function updateInterview(
  id: string,
  body: UpdateInterviewBody
): Promise<Interview> {
  const { data } = await api.patch<InterviewApiRecord>(
    `/interviews/${id}`,
    body
  );
  return interviewFromApi(data);
}

export async function deleteInterview(id: string): Promise<void> {
  await api.delete(`/interviews/${id}`);
}
