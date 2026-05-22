"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCalendarStatus } from "../api/calendar-api";

export function useCalendarStatus() {
  return useQuery({
    queryKey: ["calendar", "status"],
    queryFn: fetchCalendarStatus,
  });
}
