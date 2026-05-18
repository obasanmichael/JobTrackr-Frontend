import type { ResumeReview as UiResumeReview } from "@/types";

/** Shape returned by `POST` / `GET` `/resume-reviews` (Nest serializes dates as ISO strings). */
export interface ResumeReviewApiRecord {
  id: string;
  userId: string;
  resumeId: string;
  applicationId: string | null;
  jobId: string | null;
  type: UiResumeReview["type"];
  overallScore: number | null;
  atsScore: number | null;
  keywordScore: number | null;
  structureScore: number | null;
  clarityScore: number | null;
  strengths: unknown;
  weaknesses: unknown;
  missingKeywords: unknown;
  suggestions: unknown;
  improvedBullets: unknown;
  rawAiOutput?: Record<string, unknown> | null;
  summary: string | null;
  status: UiResumeReview["status"];
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export function resumeReviewFromApi(raw: ResumeReviewApiRecord): UiResumeReview {
  return {
    id: raw.id,
    userId: raw.userId,
    resumeId: raw.resumeId,
    applicationId: raw.applicationId,
    jobId: raw.jobId,
    type: raw.type,
    overallScore: raw.overallScore,
    atsScore: raw.atsScore,
    keywordScore: raw.keywordScore,
    structureScore: raw.structureScore,
    clarityScore: raw.clarityScore,
    strengths: raw.strengths,
    weaknesses: raw.weaknesses,
    missingKeywords: raw.missingKeywords,
    suggestions: raw.suggestions,
    improvedBullets: raw.improvedBullets,
    summary: raw.summary,
    status: raw.status,
    errorMessage: raw.errorMessage,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}
