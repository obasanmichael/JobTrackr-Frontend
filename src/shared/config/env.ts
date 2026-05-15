/**
 * Public runtime config. Only `NEXT_PUBLIC_*` values belong here.
 */
export function getPublicApiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1"
  );
}
