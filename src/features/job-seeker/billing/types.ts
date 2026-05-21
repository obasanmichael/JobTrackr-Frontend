export type SubscriptionStatus =
  | "BETA"
  | "ACTIVE"
  | "TRIALING"
  | "PAST_DUE"
  | "CANCELLED"
  | "EXPIRED";

export type BillingProvider = "NONE" | "STRIPE";

export interface EntitlementEntryApi {
  featureKey: string;
  isEnabled: boolean;
  limitValue: number | null;
}

export interface BillingMeApi {
  planCode: string;
  planName: string;
  subscriptionStatus: SubscriptionStatus;
  billingProvider: BillingProvider;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  entitlements: EntitlementEntryApi[];
  stripeConfigured: boolean;
}

export interface PlanSummaryApi {
  code: string;
  name: string;
  description: string | null;
  priceMonthly: number | null;
  currency: string;
  checkoutAvailable: boolean;
  isBeta: boolean;
  sortOrder: number;
}

export interface EntitlementsMeApi {
  entitlements: EntitlementEntryApi[];
}

export interface CheckoutSessionApi {
  url: string | null;
}

export interface CustomerPortalApi {
  url: string;
}

export interface CreateCheckoutSessionInput {
  planCode: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCustomerPortalInput {
  returnUrl?: string;
}
