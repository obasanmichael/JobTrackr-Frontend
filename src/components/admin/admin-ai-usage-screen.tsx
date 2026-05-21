"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

/** Placeholder for AI quota & usage reports (G9). */
export function AdminAiUsageScreen() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AI usage"
        description="Per-tenant AI quota and consumption will appear here."
      />

      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <Sparkles className="h-10 w-10 text-amber-600/80" aria-hidden />
        <p className="max-w-md text-sm text-muted-foreground">
          Usage dashboards and exports are not wired yet. This section will align with the
          product billing entitlements and audit trail.
        </p>
        <Link
          href="/admin"
          className="text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
        >
          Back to overview
        </Link>
      </Card>
    </div>
  );
}
