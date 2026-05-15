"use client";

import { use, useEffect, useState } from "react";
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
  const { applications, ensureApplication } = useApplicationStore();
  const [fetchAttempted, setFetchAttempted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setFetchAttempted(false));
    let cancelled = false;
    void ensureApplication(id).finally(() => {
      if (!cancelled) setFetchAttempted(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id, ensureApplication]);

  const application = applications.find((a) => a.id === id) ?? null;

  if (!mounted) return <ApplicationDetailSkeleton />;

  if (!fetchAttempted && !application) {
    return <ApplicationDetailSkeleton />;
  }

  if (fetchAttempted && !application) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm font-medium">Application not found</p>
        <Button variant="outline" size="sm" className="mt-4" asChild>
          <Link href="/dashboard/applications">Back to applications</Link>
        </Button>
      </div>
    );
  }

  if (!application) {
    return <ApplicationDetailSkeleton />;
  }

  return <ApplicationForm existing={application} />;
}
