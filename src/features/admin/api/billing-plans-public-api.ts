import { api } from "@/shared/lib/http-client";
import type { BillingPlanPublicApi } from "@/features/admin/types";

export async function listPublicBillingPlans(): Promise<BillingPlanPublicApi[]> {
  const { data } = await api.get<BillingPlanPublicApi[]>("/billing/plans");
  return data;
}
