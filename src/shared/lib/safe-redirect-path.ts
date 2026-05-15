/**
 * Prevents open redirects: only same-origin relative paths are allowed.
 */
export function getSafeInternalRedirectPath(
  raw: string | null
): string | undefined {
  if (!raw) return undefined;
  try {
    const path = decodeURIComponent(raw);
    if (path.startsWith("/") && !path.startsWith("//")) return path;
  } catch {
    /* ignore malformed next= */
  }
  return undefined;
}
