export type JobSourceSubmissionApiRecord = {
  id: string;
  companyName: string;
  careersUrl: string;
  submitterEmail: string | null;
  submitterUserId: string | null;
  detectedAtsType: string | null;
  detectedSlug: string | null;
  status: string;
  jobSourceId: string | null;
  reviewerNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateJobSourceSubmissionPayload = {
  companyName: string;
  careersUrl: string;
  submitterEmail?: string;
};

export type JobSourceSubmission = {
  id: string;
  companyName: string;
  careersUrl: string;
  submitterEmail: string | null;
  detectedAtsType: string | null;
  detectedSlug: string | null;
  status: string;
  createdAt: string;
};
