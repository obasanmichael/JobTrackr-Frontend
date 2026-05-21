"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  getAdminUser,
  patchAdminUserDisplayName,
} from "@/features/admin/api/admin-users-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";

export function AdminUserDetailScreen({ userId }: { userId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const q = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => getAdminUser(userId),
  });

  const mutation = useMutation({
    mutationFn: (next: string) => patchAdminUserDisplayName(userId, next),
    onSuccess: () => {
      toast.success("Display name updated");
      void queryClient.invalidateQueries({ queryKey: ["admin", "user", userId] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  if (q.isPending) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-destructive">User not found or inaccessible.</p>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
          Back to users
        </Button>
      </div>
    );
  }

  const u = q.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={u.name} description={u.email} />
        <Button variant="outline" asChild>
          <Link href="/admin/users">Back to list</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Profile</h2>
          <p className="mt-1 text-xs text-muted-foreground">Audited when you save changes.</p>
          <UserDisplayNameForm
            key={`${userId}-${u.updatedAt}`}
            serverName={u.name}
            isPending={mutation.isPending}
            onSave={(next) => mutation.mutate(next)}
          />
          <dl className="mt-6 space-y-2 text-sm text-muted-foreground">
            <div>
              <dt className="font-medium text-foreground">User id</dt>
              <dd className="mt-0.5 font-mono text-xs">{u.id}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Joined</dt>
              <dd className="mt-0.5">{formatIso(u.createdAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold">Subscription snapshot</h2>
          {u.subscription ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-medium">
                  {u.subscription.planName ?? u.subscription.planCode ?? "—"}
                  {u.subscription.planCode ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({u.subscription.planCode})
                    </span>
                  ) : null}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium">{u.subscription.status}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Billing provider</dt>
                <dd className="font-medium">{u.subscription.billingProvider}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No subscription row yet.</p>
          )}
          <Button className="mt-6" variant="outline" asChild>
            <Link href={`/admin/subscriptions?focus=${u.id}`}>Adjust in subscriptions</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}

function UserDisplayNameForm({
  serverName,
  isPending,
  onSave,
}: {
  serverName: string;
  isPending: boolean;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(serverName);

  return (
    <form
      className="mt-4 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed || trimmed === serverName) {
          return;
        }
        onSave(trimmed);
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="admin-name">Display name</Label>
        <Input
          id="admin-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="off"
        />
      </div>
      <Button type="submit" disabled={isPending || name.trim() === serverName}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving
          </>
        ) : (
          "Save name"
        )}
      </Button>
    </form>
  );
}

function formatIso(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, yyyy HH:mm");
  } catch {
    return iso;
  }
}
