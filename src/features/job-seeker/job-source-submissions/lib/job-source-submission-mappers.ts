import type {
  JobSourceSubmission,
  JobSourceSubmissionApiRecord,
} from "../types";

export function jobSourceSubmissionFromApi(
  raw: JobSourceSubmissionApiRecord,
): JobSourceSubmission {
  return {
    id: raw.id,
    companyName: raw.companyName,
    careersUrl: raw.careersUrl,
    submitterEmail: raw.submitterEmail,
    detectedAtsType: raw.detectedAtsType,
    detectedSlug: raw.detectedSlug,
    status: raw.status,
    createdAt: raw.createdAt,
  };
}
