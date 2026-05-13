"use client";

import { useApplicationStore } from "@/hooks/useApplicationStore";
import { ApplicationForm } from "@/components/applications/application-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditApplicationPage({ params }: { params: { id: string } }) {
  const { getApplication } = useApplicationStore();
  const application = getApplication(params.id);

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium">Application not found</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/dashboard/applications">Back to applications</Link>
        </Button>
      </div>
    );
  }

  return <ApplicationForm existing={application} />;
}
