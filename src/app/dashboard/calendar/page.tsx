import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { CalendarSettingsScreen } from "@/components/calendar/calendar-settings-screen";

function CalendarLoadingFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading calendar…
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarLoadingFallback />}>
      <CalendarSettingsScreen />
    </Suspense>
  );
}
