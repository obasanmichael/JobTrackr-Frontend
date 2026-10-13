import axios from "axios";

const GENERIC = "Something went wrong. Please try again.";
const INVALID_CREDENTIALS_USER_MESSAGE =
  "Invalid email or password.";
const SESSION_EXPIRED_MESSAGE =
  "Session expired. Please log in again.";

const AI_UNAVAILABLE_MESSAGE =
  "Our AI review service is temporarily unavailable. This isn't caused by your resume — please try again later.";

/**
 * Turns raw/technical error text (e.g. provider errors stored on failed
 * reviews) into a short, plain-language explanation for end users.
 */
export function toFriendlyErrorMessage(raw: string | null | undefined): string {
  const text = (raw ?? "").trim();
  if (!text) return GENERIC;
  const lower = text.toLowerCase();

  if (
    lower.includes("openai") ||
    lower.includes("quota") ||
    lower.includes("no credits") ||
    lower.includes("billing") ||
    lower.includes("rate limit") ||
    lower.includes("bad gateway") ||
    lower.includes("resume review failed")
  ) {
    return AI_UNAVAILABLE_MESSAGE;
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "The review took too long to complete. Please try again.";
  }
  if (lower.includes("validation") || lower.includes("unprocessable")) {
    return "We couldn't turn the AI's response into a usable review. Please try again.";
  }
  if (/\bhttp \d{3}\b|\b[45]\d{2}\b/.test(lower)) return GENERIC;
  return text;
}

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

  if (typeof raw === "string" && status !== undefined && status >= 500 && status !== 502) {
    return GENERIC;
  }
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw) && raw.length > 0) return String(raw[0]);

  if (status === 502 || status === 503 || status === 504) {
    return "The service is temporarily unavailable. Please try again in a moment.";
  }

  if (status === 429) {
    return "Too many requests right now. Please wait a moment and try again.";
  }
  if (status === 409) {
    return "This conflicts with something that already exists. Refresh the page and try again.";
  }
  if (status === 422) {
    return "We couldn't process that request. Please check your input and try again.";
  }
  return GENERIC;
}
