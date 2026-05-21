"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBillingMe, fetchEntitlementsMe } from "../api/billing-api";

export function useBilling() {
  return useQuery({
    queryKey: ["billing", "me"],
    queryFn: fetchBillingMe,
  });
}

export function useEntitlements() {
  return useQuery({
    queryKey: ["entitlements", "me"],
    queryFn: fetchEntitlementsMe,
  });
}
