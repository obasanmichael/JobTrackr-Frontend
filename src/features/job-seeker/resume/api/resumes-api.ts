import { api } from "@/shared/lib/http-client";
import { getPublicApiBaseUrl } from "@/shared/config/env";
import { AUTH_STORAGE_KEYS } from "@/shared/config/auth-storage-keys";
import { getResponseErrorMessage } from "@/shared/lib/response-errors";
import type {
  CandidateProfile,
  Resume,
  UpdateCandidateProfilePayload,
  UpdateResumePayload,
} from "@/types";
import {
  type CandidateProfileApiRecord,
  type ResumeApiRecord,
  candidateProfileFromApi,
  resumeFromApi,
  updateProfilePayloadToApi,
} from "../lib/resume-mappers";

function handleUnauthorizedIfNeeded(status: number): void {
  if (status !== 401 || typeof window === "undefined") return;
  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.user);
  if (!window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

export async function listResumes(): Promise<Resume[]> {
  const { data } = await api.get<ResumeApiRecord[]>("/resumes");
  return data.map(resumeFromApi);
}

export async function getResume(id: string): Promise<Resume> {
  const { data } = await api.get<ResumeApiRecord>(`/resumes/${id}`);
  return resumeFromApi(data);
}

/** POST `/resumes/:id/set-active`, only one active resume per user. */
export async function postResumeSetActive(id: string): Promise<Resume> {
  const { data } = await api.post<ResumeApiRecord>(`/resumes/${id}/set-active`);
  return resumeFromApi(data);
}

/** POST `/resumes/:id/unarchive`, restore an archived resume to PARSED/FAILED/UPLOADED. */
export async function postResumeUnarchive(id: string): Promise<Resume> {
  const { data } = await api.post<ResumeApiRecord>(`/resumes/${id}/unarchive`);
  return resumeFromApi(data);
}

/** PATCH `/resumes/:id`, e.g. `{ status: "ARCHIVED" }` or `{ isActive: false }`. */
export async function updateResume(id: string, payload: UpdateResumePayload): Promise<Resume> {
  const { data } = await api.patch<ResumeApiRecord>(`/resumes/${id}`, payload);
  return resumeFromApi(data);
}

export async function deleteResume(id: string): Promise<void> {
  await api.delete(`/resumes/${id}`);
}

export async function getCandidateProfile(resumeId: string): Promise<CandidateProfile> {
  const { data } = await api.get<CandidateProfileApiRecord>(`/resumes/${resumeId}/profile`);
  return candidateProfileFromApi(data);
}

export async function updateCandidateProfile(
  resumeId: string,
  payload: UpdateCandidateProfilePayload
): Promise<CandidateProfile> {
  const { data } = await api.patch<CandidateProfileApiRecord>(
    `/resumes/${resumeId}/profile`,
    updateProfilePayloadToApi(payload)
  );
  return candidateProfileFromApi(data);
}

/** Multipart upload, uses `fetch` so the client sets the multipart boundary correctly. */
export async function uploadResumeFile(file: File): Promise<Resume> {
  const url = `${getPublicApiBaseUrl()}/resumes/upload`;
  const token =
    typeof window !== "undefined" ? localStorage.getItem(AUTH_STORAGE_KEYS.accessToken) : null;

  const body = new FormData();
  body.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });

  if (!res.ok) {
    handleUnauthorizedIfNeeded(res.status);
    throw new Error(await getResponseErrorMessage(res));
  }

  const data = (await res.json()) as ResumeApiRecord;
  return resumeFromApi(data);
}
