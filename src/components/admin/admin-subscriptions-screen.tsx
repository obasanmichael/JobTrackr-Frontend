"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { Loader2, Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  listAdminSubscriptions,
  patchAdminSubscription,
} from "@/features/admin/api/admin-subscriptions-api";
import { listPublicBillingPlans } from "@/features/admin/api/billing-plans-public-api";
import type { AdminSubscriptionRowApi } from "@/features/admin/types";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUBSCRIPTION_STATUSES = [
  "BETA",
  "ACTIVE",
  "TRIALING",
  "PAST_DUE",
  "CANCELLED",
  "EXPIRED",
] as const;

export function AdminSubscriptionsScreen() {
  const searchParams = useSearchParams();
  const focusUserId = searchParams.get("focus");

  const [page, setPage] = useState(1);
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const limit = 15;

  const q = useQuery({
    queryKey: ["admin", "subscriptions", page, search, limit],
    queryFn: () =>
      listAdminSubscriptions({ page, limit, search: search || undefined }),
  });

  const plansQ = useQuery({
    queryKey: ["admin", "billing-plans"],
    queryFn: listPublicBillingPlans,
  });

  const totalPages = q.data?.totalPages ?? 1;
  const focusRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    if (!focusUserId || !focusRef.current) {
      return;
    }
    focusRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusUserId, q.data?.items]);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSubscriptionRowApi | null>(null);
  const [planCode, setPlanCode] = useState("");
  const [status, setStatus] = useState<string>("");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (body: { planCode?: string; status?: string }) => {
      if (!editing) {
        throw new Error("No row selected");
      }
      return patchAdminSubscription(editing.userId, body);
    },
    onSuccess: () => {
      toast.success("Subscription updated");
      void queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "user"] });
      setEditOpen(false);
      setEditing(null);
    },
    onError: (err) => {
      toast.error(getApiErrorMessage(err));
    },
  });

  const planItems = plansQ.data ?? [];

  function openEdit(row: AdminSubscriptionRowApi) {
    setEditing(row);
    setPlanCode(row.plan.code);
    setStatus(row.status);
    setEditOpen(true);
  }

  const rows = q.data?.items ?? [];

  function saveEdits() {
    if (!editing) {
      return;
    }
    const nextPlan = planCode === editing.plan.code ? undefined : planCode;
    const nextStatus = status === editing.status ? undefined : status;
    if (nextPlan === undefined && nextStatus === undefined) {
      toast.message("No changes to apply");
      return;
    }
    mutation.mutate({
      planCode: nextPlan,
      status: nextStatus,
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Search by user name or email. Adjust plan and status when supporting customers."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label
            htmlFor="admin-sub-search"
            className="text-xs font-medium text-muted-foreground"
          >
            Search
          </label>
          <Input
            id="admin-sub-search"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(draftSearch.trim());
                setPage(1);
              }
            }}
            placeholder="Email or name…"
          />
        </div>
        <Button
          type="button"
          onClick={() => {
            setSearch(draftSearch.trim());
            setPage(1);
          }}
        >
          Apply
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Billing</th>
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {q.isPending ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </td>
                </tr>
              ) : q.isError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-destructive">
                    Failed to load subscriptions.
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No subscriptions match this search.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const isFocus = Boolean(focusUserId && focusUserId === row.userId);
                  return (
                    <tr
                      key={row.id}
                      ref={isFocus ? focusRef : undefined}
                      className={
                        isFocus
                          ? "bg-amber-500/10"
                          : "hover:bg-muted/30"
                      }
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{row.user.name}</div>
                        <div className="text-xs text-muted-foreground">{row.user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{row.plan.name}</span>
                        <span className="ml-1 text-xs text-muted-foreground">({row.plan.code})</span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">{row.status}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {row.billingProvider}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatUpdated(row.updatedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/users/${row.userId}`}>User</Link>
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            type="button"
                            onClick={() => openEdit(row)}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {totalPages > 1 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            Page {page} of {totalPages} · {q.data?.total ?? 0} total
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit subscription</DialogTitle>
            <DialogDescription>
              {editing ? (
                <>
                  {editing.user.name} — {editing.user.email}
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          {editing && plansQ.isPending ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : editing && plansQ.isError ? (
            <p className="text-sm text-destructive">Could not load billing plans.</p>
          ) : editing && plansQ.isSuccess ? (
            planItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active plans returned from the API.</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Plan</Label>
                  <Select value={planCode} onValueChange={setPlanCode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {planItems.map((p) => (
                        <SelectItem key={p.code} value={p.code}>
                          {p.name} ({p.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBSCRIPTION_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={mutation.isPending || !editing || plansQ.isPending || plansQ.isError}
              onClick={saveEdits}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatUpdated(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, yyyy HH:mm");
  } catch {
    return iso;
  }
}
