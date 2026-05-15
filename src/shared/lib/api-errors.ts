import axios from "axios";

const GENERIC = "Something went wrong. Please try again.";
const INVALID_CREDENTIALS_USER_MESSAGE =
  "Invalid email or password.";
const SESSION_EXPIRED_MESSAGE =
  "Session expired. Please log in again.";

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) return GENERIC;

  const status = error.response?.status;
  const raw = error.response?.data?.message;

  if (status === 401) {
    const msg =
      typeof raw === "string"
        ? raw
        : Array.isArray(raw)
          ? String(raw[0])
          : "";
    if (msg.toLowerCase().includes("invalid credential")) {
      return INVALID_CREDENTIALS_USER_MESSAGE;
    }
    return SESSION_EXPIRED_MESSAGE;
  }

  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw.length > 0) return String(raw[0]);

  return GENERIC;
}
