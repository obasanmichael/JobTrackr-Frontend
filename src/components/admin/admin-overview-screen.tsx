"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, Users, Wallet } from "lucide-react";
import { listAdminSubscriptions } from "@/features/admin/api/admin-subscriptions-api";
import { listAdminUsers } from "@/features/admin/api/admin-users-api";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

export function AdminOverviewScreen() {
  const usersQ = useQuery({
    queryKey: ["admin", "overview", "users-total"],
    queryFn: () => listAdminUsers({ page: 1, limit: 1 }),
  });
  const subsQ = useQuery({
    queryKey: ["admin", "overview", "subs-total"],
    queryFn: () => listAdminSubscriptions({ page: 1, limit: 1 }),
  });

  const userTotal = usersQ.data?.total ?? "—";
  const subTotal = subsQ.data?.total ?? "—";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Overview"
        description="High-level counts across accounts and billing."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Registered users
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{userTotal}</p>
            </div>
            <Users className="h-8 w-8 text-amber-600/80" />
          </div>
          <Link
            href="/admin/users"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
          >
            Manage users
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Subscriptions
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{subTotal}</p>
            </div>
            <Wallet className="h-8 w-8 text-amber-600/80" />
          </div>
          <Link
            href="/admin/subscriptions"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
          >
            View subscriptions
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>

      <Card className="p-5">
        <p className="text-sm font-medium text-foreground">Quick links</p>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>
            <Link href="/admin/subscriptions" className="text-amber-700 hover:underline dark:text-amber-400">
              Subscriptions
            </Link>
          </li>
          <li>
            <Link href="/admin/job-sources" className="text-amber-700 hover:underline dark:text-amber-400">
              Job sources & ingest
            </Link>
          </li>
          <li>
            <Link href="/admin/ai-usage" className="text-amber-700 hover:underline dark:text-amber-400">
              AI usage
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className="text-amber-700 hover:underline dark:text-amber-400">
              Admin settings
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="text-amber-700 hover:underline dark:text-amber-400">
              Return to job seeker dashboard
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}
