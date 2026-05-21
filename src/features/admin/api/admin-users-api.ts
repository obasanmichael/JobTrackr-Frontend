import type {
  AdminUserDetailApi,
  AdminUserSummaryApi,
  AdminUsersPageApi,
} from "@/features/admin/types";
import { api } from "@/shared/lib/http-client";

export async function listAdminUsers(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<AdminUsersPageApi> {
  const { data } = await api.get<AdminUsersPageApi>("/admin/users", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      search: params.search?.trim() || undefined,
    },
  });
  return data;
}

export async function getAdminUser(userId: string): Promise<AdminUserDetailApi> {
  const { data } = await api.get<AdminUserDetailApi>(`/admin/users/${userId}`);
  return data;
}

export async function patchAdminUserDisplayName(
  userId: string,
  name: string,
): Promise<AdminUserSummaryApi> {
  const { data } = await api.patch<AdminUserSummaryApi>(
    `/admin/users/${userId}`,
    { name },
  );
  return data;
}
