import type { LoginPayload, User } from "@/types";
import { api } from "@/shared/lib/http-client";
import type { AuthResponse, RegisterRequestBody } from "../types";

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
  };
}

export async function loginRequest(
  payload: LoginPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return {
    accessToken: data.accessToken,
    user: normalizeUser(data.user),
  };
}

export async function registerRequest(
  payload: RegisterRequestBody
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return {
    accessToken: data.accessToken,
    user: normalizeUser(data.user),
  };
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return normalizeUser(data);
}
