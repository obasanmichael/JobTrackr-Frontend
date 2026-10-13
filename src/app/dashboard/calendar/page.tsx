import { Suspense } from "react";
import { CardStackSkeleton } from "@/components/ui/page-skeletons";
import { CalendarSettingsScreen } from "@/components/calendar/calendar-settings-screen";

function CalendarLoadingFallback() {
  return <CardStackSkeleton label="Loading calendar" headerAction />;
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarLoadingFallback />}>
      <CalendarSettingsScreen />
    </Suspense>
  );
}
