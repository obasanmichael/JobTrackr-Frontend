import { api } from "@/shared/lib/http-client";
import type {
  BillingMeApi,
  CheckoutSessionApi,
  CreateCheckoutSessionInput,
  CreateCustomerPortalInput,
  CustomerPortalApi,
  EntitlementsMeApi,
  PlanSummaryApi,
} from "../types";

export async function fetchBillingMe(): Promise<BillingMeApi> {
  const { data } = await api.get<BillingMeApi>("/billing/me");
  return data;
}

export async function fetchPlans(): Promise<PlanSummaryApi[]> {
  const { data } = await api.get<PlanSummaryApi[]>("/billing/plans");
  return data;
}

export async function fetchEntitlementsMe(): Promise<EntitlementsMeApi> {
  const { data } = await api.get<EntitlementsMeApi>("/entitlements/me");
  return data;
}

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CheckoutSessionApi> {
  const { data } = await api.post<CheckoutSessionApi>(
    "/billing/create-checkout-session",
    input,
  );
  return data;
}

export async function createCustomerPortal(
  input: CreateCustomerPortalInput = {},
): Promise<CustomerPortalApi> {
  const { data } = await api.post<CustomerPortalApi>(
    "/billing/customer-portal",
    input,
  );
  return data;
}
