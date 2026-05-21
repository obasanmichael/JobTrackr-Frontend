import type { EntitlementEntryApi, PlanSummaryApi, SubscriptionStatus } from "../types";

export const FEATURE_LABELS: Record<string, string> = {
  AI_RESUME_REVIEW: "AI resume review",
  JOB_MATCHING: "Job matching",
  JOB_ALERTS: "Job alerts",
  RESUME_UPLOADS: "Resume uploads",
  SAVED_JOBS: "Saved jobs",
  CALENDAR_SYNC: "Calendar sync",
  BROWSER_EXTENSION: "Browser extension",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  BETA: "Beta access",
  ACTIVE: "Active",
  TRIALING: "Trial",
  PAST_DUE: "Past due",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export function getFeatureLabel(featureKey: string): string {
  return FEATURE_LABELS[featureKey] ?? featureKey.replaceAll("_", " ").toLowerCase();
}

export function getSubscriptionStatusLabel(status: SubscriptionStatus): string {
  return SUBSCRIPTION_STATUS_LABELS[status] ?? status;
}

export function formatPlanPrice(plan: Pick<PlanSummaryApi, "priceMonthly" | "currency">): string {
  if (plan.priceMonthly == null || plan.priceMonthly <= 0) {
    return "Free";
  }

  const amount = plan.priceMonthly / 100;
  const currency = plan.currency.toUpperCase();

  try {
    return `${new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)}/mo`;
  } catch {
    return `${currency} ${amount.toFixed(2)}/mo`;
  }
}

export function formatEntitlementLimit(
  entitlement: Pick<EntitlementEntryApi, "featureKey" | "limitValue">,
): string {
  if (entitlement.limitValue == null) {
    return "Unlimited";
  }

  if (entitlement.featureKey === "AI_RESUME_REVIEW") {
    return `${entitlement.limitValue} reviews / month`;
  }

  return `${entitlement.limitValue} / month`;
}

export function sortPlans(plans: PlanSummaryApi[]): PlanSummaryApi[] {
  return [...plans].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getBillingPageUrl(): string {
  if (typeof window === "undefined") {
    return "/dashboard/billing";
  }

  return `${window.location.origin}/dashboard/billing`;
}
