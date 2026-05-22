import type { User } from "@/types";
import { api } from "@/shared/lib/http-client";

function normalizeUser(raw: User & { updatedAt?: string }): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    createdAt:
      typeof raw.createdAt === "string"
        ? raw.createdAt
        : String(raw.createdAt),
    updatedAt:
      raw.updatedAt !== undefined
        ? typeof raw.updatedAt === "string"
          ? raw.updatedAt
          : String(raw.updatedAt)
        : undefined,
    avatarUrl: raw.avatarUrl ?? null,
    timezone: raw.timezone ?? null,
  };
}

export async function updateUserProfileRequest(payload: {
  name?: string;
  timezone?: string | null;
}): Promise<User> {
  const { data } = await api.patch<User>("/users/me", payload);
  return normalizeUser(data);
}

export async function uploadUserAvatarRequest(file: File): Promise<User> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<User>("/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return normalizeUser(data);
}

export async function deleteUserAvatarRequest(): Promise<User> {
  const { data } = await api.delete<User>("/users/me/avatar");
  return normalizeUser(data);
}

export { normalizeUser };
