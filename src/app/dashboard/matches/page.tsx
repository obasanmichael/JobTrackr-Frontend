import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Sparkles } from "lucide-react";

export default function MatchedJobsPlaceholderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Matched jobs"
        description="AI-ranked recommendations grounded in your candidate profile arrive in Phase V2B once matching endpoints are wired."
      />
      <EmptyState
        icon={Sparkles}
        title="Matching is preview-only"
        description="Upload your resume on the Resume page so we’re ready when scores and rationale land from the backend."
        action={
          <Button variant="secondary" size="sm" asChild>
            <Link href="/dashboard/resume">Go to resumes</Link>
          </Button>
        }
      />
    </div>
  );
}
