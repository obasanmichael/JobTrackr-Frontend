"use client";

import { useAuthContext } from "@/features/auth/providers/auth-provider";

export function useAuth() {
  return useAuthContext();
}
