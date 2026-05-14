"use client";

import { use } from "react";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { useMounted } from "@/hooks/useMounted";
import { ApplicationForm } from "@/components/applications/application-form";
import { ApplicationDetailSkeleton } from "@/components/applications/applications-skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const mounted = useMounted();
  const { getApplication } = useApplicationStore();

  if (!mounted) return <ApplicationDetailSkeleton />;

  const application = getApplication(id);

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
