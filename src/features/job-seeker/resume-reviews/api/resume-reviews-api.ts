import { api } from "@/shared/lib/http-client";
import type {
  CreateResumeReviewPayload,
  ListResumeReviewsQuery,
  ResumeReview,
  ResumeReviewListResult,
} from "@/types";
import {
  type ResumeReviewApiRecord,
  resumeReviewFromApi,
} from "../lib/resume-review-mappers";

function buildListParams(query?: ListResumeReviewsQuery): Record<string, string | number> | undefined {
  if (!query) return undefined;
  const out: Record<string, string | number> = {};
  if (query.page != null) out.page = query.page;
  if (query.limit != null) out.limit = query.limit;
  if (query.resumeId) out.resumeId = query.resumeId;
  if (query.type) out.type = query.type;
  if (query.status) out.status = query.status;
  return Object.keys(out).length ? out : undefined;
}

export async function createResumeReview(
  payload: CreateResumeReviewPayload
): Promise<ResumeReview> {
  const { data } = await api.post<ResumeReviewApiRecord>("/resume-reviews", payload);
  return resumeReviewFromApi(data);
}

interface ResumeReviewListApiEnvelope {
  items: ResumeReviewApiRecord[];
  total: number;
  page: number;
  limit: number;
}

export async function listResumeReviews(
  query?: ListResumeReviewsQuery
): Promise<ResumeReviewListResult> {
  const { data } = await api.get<ResumeReviewListApiEnvelope>("/resume-reviews", {
    params: buildListParams(query),
  });
  return {
    items: data.items.map(resumeReviewFromApi),
    total: data.total,
    page: data.page,
    limit: data.limit,
  };
}

export async function getResumeReview(id: string): Promise<ResumeReview> {
  const { data } = await api.get<ResumeReviewApiRecord>(`/resume-reviews/${id}`);
  return resumeReviewFromApi(data);
}
