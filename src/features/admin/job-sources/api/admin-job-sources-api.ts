import { api } from "@/shared/lib/http-client";
import type {
  ExternalJobInactivePurgeResultApi,
  ExternalJobQualityScanResultApi,
  JobSourceAdminApi,
  JobSourceBulkSyncResultApi,
  JobSourceSyncResultApi,
} from "../types";

export async function listAdminJobSources(): Promise<JobSourceAdminApi[]> {
  const { data } = await api.get<JobSourceAdminApi[]>("/admin/job-sources");
  return data;
}

export async function syncAdminJobSource(
  jobSourceId: string,
): Promise<JobSourceSyncResultApi> {
  const { data } = await api.post<JobSourceSyncResultApi>(
    `/admin/job-sources/${jobSourceId}/sync`,
  );
  return data;
}

export async function syncAllActiveAdminJobSources(): Promise<JobSourceBulkSyncResultApi> {
  const { data } = await api.post<JobSourceBulkSyncResultApi>(
    "/admin/job-sources/sync-active",
  );
  return data;
}

export async function runExternalJobQualityScan(): Promise<ExternalJobQualityScanResultApi> {
  const { data } = await api.post<ExternalJobQualityScanResultApi>(
    "/admin/job-quality/scan",
  );
  return data;
}

export async function purgeInactiveExternalJobs(options?: {
  dryRun?: boolean;
}): Promise<ExternalJobInactivePurgeResultApi> {
  const { data } = await api.post<ExternalJobInactivePurgeResultApi>(
    "/admin/job-quality/purge-inactive",
    undefined,
    {
      params: {
        dryRun: options?.dryRun ? "true" : undefined,
      },
    },
  );
  return data;
}
