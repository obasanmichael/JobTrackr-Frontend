import type { LoginPayload, User } from "@/types";
import { api } from "@/shared/lib/http-client";
import type { AuthResponse, RegisterRequestBody } from "../types";
import { normalizeUser } from "@/features/users/api/users-api";

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
