/**
 * Parses Nest `{ message: string | string[] }`-style bodies for non-Axios requests (e.g. multipart upload).
 */

const GENERIC = "Something went wrong. Please try again.";

interface NestStyleBody {
  message?: unknown;
}

export async function getResponseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as NestStyleBody;
    const raw = data?.message;
    if (typeof raw === "string" && raw.trim()) return raw;
    if (Array.isArray(raw) && raw.length > 0) return String(raw[0]);
  } catch {
    // ignore
  }
  if (response.statusText) return `${response.status} ${response.statusText}`;
  return GENERIC;
}
