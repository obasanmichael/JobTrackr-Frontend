import axios from "axios";
import { getPublicApiBaseUrl } from "@/shared/config/env";
import { AUTH_STORAGE_KEYS } from "@/shared/config/auth-storage-keys";

export const api = axios.create({
  baseURL: getPublicApiBaseUrl(),
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/**
 * 401 on credential exchange (login/register) must not hard-redirect or the UI
 * cannot show a friendly error. Only treat 401 as session loss for other routes.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const reqUrl = String(error.config?.url ?? "");
    const isCredentialExchange =
      reqUrl.includes("/auth/login") || reqUrl.includes("/auth/register");

    if (
      status === 401 &&
      typeof window !== "undefined" &&
      !isCredentialExchange
    ) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
      localStorage.removeItem(AUTH_STORAGE_KEYS.user);
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
