"use client";

// Auth guard is disabled during UI development.
// Re-enable before connecting the backend.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
