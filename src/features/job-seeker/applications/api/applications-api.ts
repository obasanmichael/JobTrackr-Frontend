import { api } from "@/shared/lib/http-client";
import type { ApplicationApiRecord } from "../lib/application-mappers";
import {
  applicationFromApi,
  createPayloadToApi,
  updatePayloadToApi,
} from "../lib/application-mappers";
import type { Application, CreateApplicationPayload, UpdateApplicationPayload } from "@/types";

export async function listApplications(search?: string): Promise<Application[]> {
  const { data } = await api.get<ApplicationApiRecord[]>("/applications", {
    params: search?.trim() ? { search: search.trim() } : undefined,
  });
  return data.map(applicationFromApi);
}

export async function getApplication(id: string): Promise<Application> {
  const { data } = await api.get<ApplicationApiRecord>(`/applications/${id}`);
  return applicationFromApi(data);
}

export async function createApplication(
  payload: CreateApplicationPayload
): Promise<Application> {
  const { data } = await api.post<ApplicationApiRecord>(
    "/applications",
    createPayloadToApi(payload)
  );
  return applicationFromApi(data);
}

export async function updateApplication(
  id: string,
  payload: UpdateApplicationPayload
): Promise<Application> {
  const { data } = await api.patch<ApplicationApiRecord>(
    `/applications/${id}`,
    updatePayloadToApi(payload)
  );
  return applicationFromApi(data);
}

export async function deleteApplication(id: string): Promise<void> {
  await api.delete(`/applications/${id}`);
}
