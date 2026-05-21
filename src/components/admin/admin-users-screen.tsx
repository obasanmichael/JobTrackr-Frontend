"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { listAdminUsers } from "@/features/admin/api/admin-users-api";
import type { AdminUserSummaryApi } from "@/features/admin/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";

type SortKey = "name" | "email" | "createdAt";
type SortDir = "asc" | "desc";

function sortUsers(items: AdminUserSummaryApi[], key: SortKey, dir: SortDir): AdminUserSummaryApi[] {
  const sorted = [...items].sort((a, b) => {
    const va = key === "createdAt" ? a.createdAt : a[key];
    const vb = key === "createdAt" ? b.createdAt : b[key];
    if (va < vb) {
      return dir === "asc" ? -1 : 1;
    }
    if (va > vb) {
      return dir === "asc" ? 1 : -1;
    }
    return 0;
  });
  return sorted;
}

export function AdminUsersScreen() {
  const [page, setPage] = useState(1);
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const limit = 15;
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const q = useQuery({
    queryKey: ["admin", "users", page, search, limit],
    queryFn: () => listAdminUsers({ page, limit, search: search || undefined }),
  });

  const rows = useMemo(() => {
    const items = q.data?.items ?? [];
    return sortUsers(items, sortKey, sortDir);
  }, [q.data?.items, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const totalPages = q.data?.totalPages ?? 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Search and open accounts. Sorting applies to the current page."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <label htmlFor="admin-user-search" className="text-xs font-medium text-muted-foreground">
            Search email or name
          </label>
          <Input
            id="admin-user-search"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearch(draftSearch.trim());
                setPage(1);
              }
            }}
            placeholder="Try an email fragment…"
          />
        </div>
        <Button
          type="button"
          onClick={() => {
            setSearch(draftSearch.trim());
            setPage(1);
          }}
        >
          Search
        </Button>
      </div>

      <Card className="overflow-hidden">
        {q.isPending ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : q.isError ? (
          <p className="p-6 text-sm text-destructive">Failed to load users.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort("name")}
                    >
                      Name
                      {sortKey === "name" &&
                        (sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort("email")}
                    >
                      Email
                      {sortKey === "email" &&
                        (sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => toggleSort("createdAt")}
                    >
                      Joined
                      {sortKey === "createdAt" &&
                        (sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        ))}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((u) => (
                  <tr key={u.id} className="border-b border-border/80 hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground tabular-nums">
                      {formatSafe(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="font-medium text-amber-700 hover:underline dark:text-amber-400"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {q.data && totalPages > 1 ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {q.data.total} users
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatSafe(iso: string): string {
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}
