/** Mirrors backend admin user list/detail DTOs (`job-trackr-backend/src/admin/dto`). */

export type AdminUserSummaryApi = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type AdminUsersPageApi = {
  items: AdminUserSummaryApi[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminUserSubscriptionSnapshotApi = {
  status: string;
  billingProvider: string;
  planCode: string | null;
  planName: string | null;
};

export type AdminUserDetailApi = AdminUserSummaryApi & {
  subscription: AdminUserSubscriptionSnapshotApi | null;
};

export type AdminSubscriptionRowApi = {
  id: string;
  userId: string;
  user: { id: string; email: string; name: string };
  plan: { code: string; name: string };
  status: string;
  billingProvider: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminSubscriptionsPageApi = {
  items: AdminSubscriptionRowApi[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type BillingPlanPublicApi = {
  code: string;
  name: string;
  description: string | null;
  checkoutAvailable: boolean;
};
