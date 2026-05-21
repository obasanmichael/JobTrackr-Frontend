"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

/** Placeholder for internal admin settings (G9). */
export function AdminSettingsScreen() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Console-wide preferences and feature toggles will live here."
      />

      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <Settings className="h-10 w-10 text-amber-600/80" aria-hidden />
        <p className="max-w-md text-sm text-muted-foreground">
          No admin settings are exposed in the API yet. When they are, you will configure
          them from this screen instead of environment variables.
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
