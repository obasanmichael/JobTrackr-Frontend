import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Calendar } from "lucide-react";

export default function CalendarSettingsPlaceholderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="Google Calendar OAuth and selective sync ships in Phase V2E alongside interview exports."
      />
      <EmptyState
        icon={Calendar}
        title="Calendar integration coming soon"
        description="You'll connect Google Calendar from here once the OAuth flow endpoints are deployed."
      />
    </div>
  );
}
