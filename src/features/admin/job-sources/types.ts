export interface JobSourceAdminApi {
  id: string;
  name: string;
  type: string;
  baseUrl: string | null;
  isActive: boolean;
  requiresApiKey: boolean;
  config: Record<string, unknown> | null;
  lastSyncAt: string | null;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
  consecutiveSyncFailures: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobSourceSyncResultApi {
  jobSourceId: string;
  upsertedCount: number;
  skippedInvalid: number;
  inactivatedCount: number;
  durationMs: number;
  syncedAt: string;
}

export interface JobSourceBulkSyncResultApi {
  attempted: number;
  succeeded: number;
  failed: number;
  results: Array<{
    jobSourceId: string;
    name: string;
    ok: boolean;
    upsertedCount?: number;
    skippedInvalid?: number;
    inactivatedCount?: number;
    syncedAt?: string;
    durationMs?: number;
    errorMessage?: string;
  }>;
}

export interface ExternalJobQualityScanResultApi {
  scannedCount: number;
  suspiciousCount: number;
  clearedCount: number;
  flaggedByReason: Record<string, number>;
  durationMs: number;
}

export interface ExternalJobInactivePurgeResultApi {
  dryRun: boolean;
  enabled: boolean;
  retentionDays: number;
  cutoff: string;
  matchedCount: number;
  deletedCount: number;
  durationMs: number;
}
