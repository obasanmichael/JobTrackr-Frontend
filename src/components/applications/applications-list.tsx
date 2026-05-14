"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ApplicationsListSkeleton } from "./applications-skeleton";
import { useMounted } from "@/hooks/useMounted";
import {
  Plus,
  Search,
  Briefcase,
  ExternalLink,
  MapPin,
  ChevronRight,
  X,
  ArrowUpDown,
  CalendarClock,
  Check,
  Pencil,
  Clock,
} from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { toast } from "sonner";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUSES, STATUS_STYLES } from "@/lib/constants";
import type { Application } from "@/types";
import type { ApplicationStatus } from "@/lib/constants";

type SortKey = "newest" | "oldest" | "updated" | "deadline";
type EditableField = "location" | "deadline";

const ALL = "All";
const STATUS_FILTERS = [ALL, ...APPLICATION_STATUSES] as const;

/* ─── Company avatar ─────────────────────────────────────────────────────── */

function CompanyAvatar({ company }: { company: string }) {
  const initials = company.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  const colors = [
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  ];
  const colorIndex = company.charCodeAt(0) % colors.length;
  return (
    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold", colors[colorIndex])}>
      {initials}
    </div>
  );
}

function WorkModePill({ mode }: { mode?: string }) {
  if (!mode || mode === "Unspecified") return null;
  return (
    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
      {mode}
    </span>
  );
}

/* ─── Inline cell editors ────────────────────────────────────────────────── */

function InlineCellInput({
  value,
  placeholder,
  onSave,
  onCancel,
}: {
  value: string;
  placeholder?: string;
  onSave: (v: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); onSave(draft.trim()); }
    if (e.key === "Escape") { e.preventDefault(); onCancel(); }
  }

  return (
    <input
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onSave(draft.trim())}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      placeholder={placeholder}
      className="w-full rounded-md border border-primary/40 bg-background px-2 py-1 text-[13px] text-foreground outline-none ring-2 ring-primary/20 transition-shadow"
    />
  );
}

function InlineCellDate({
  value,
  onSave,
  onCancel,
}: {
  value?: string;
  onSave: (v: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value ? format(parseISO(value), "yyyy-MM-dd") : "");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") { e.preventDefault(); onSave(draft); }
    if (e.key === "Escape") { e.preventDefault(); onCancel(); }
  }

  return (
    <input
      type="date"
      autoFocus
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onSave(draft)}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      className="w-full rounded-md border border-primary/40 bg-background px-2 py-1 text-[13px] text-foreground outline-none ring-2 ring-primary/20 transition-shadow"
    />
  );
}

/* ─── Inline status picker ───────────────────────────────────────────────── */

function InlineStatusPicker({
  current,
  onChange,
}: {
  current: ApplicationStatus;
  onChange: (s: ApplicationStatus) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="group/status flex items-center gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Change status"
        >
          <StatusBadge status={current} />
          <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/status:opacity-60 transition-opacity" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuLabel>Set status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {APPLICATION_STATUSES.map((s) => {
          const styles = STATUS_STYLES[s];
          const isActive = s === current;
          return (
            <DropdownMenuItem
              key={s}
              onSelect={() => { if (s !== current) onChange(s as ApplicationStatus); }}
              className={cn("gap-2.5", isActive && "bg-accent")}
            >
              <span className={cn("h-2 w-2 shrink-0 rounded-full", styles?.dot ?? "bg-muted-foreground")} />
              <span>{s}</span>
              {isActive && <Check className="ml-auto h-3.5 w-3.5" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ─── Application row ────────────────────────────────────────────────────── */

const COL_CLASSES = "grid grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_20px]";

function ApplicationRow({ app }: { app: Application }) {
  const { updateApplication } = useApplicationStore();
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const deadlinePast = app.deadline && isPast(parseISO(app.deadline));

  function startEdit(e: React.MouseEvent, field: EditableField) {
    e.stopPropagation();
    setEditingField(field);
  }

  function saveLocation(value: string) {
    const trimmed = value.trim();
    if (trimmed !== (app.location ?? "")) {
      updateApplication(app.id, { location: trimmed || undefined });
      toast.success("Location updated");
    }
    setEditingField(null);
  }

  function saveDeadline(value: string) {
    const iso = value ? new Date(value + "T00:00:00").toISOString() : undefined;
    if (iso !== app.deadline) {
      updateApplication(app.id, { deadline: iso });
      toast.success(iso ? "Deadline updated" : "Deadline cleared");
    }
    setEditingField(null);
  }

  function handleStatusChange(status: ApplicationStatus) {
    updateApplication(app.id, { status });
    toast.success(`Status → ${status}`);
  }

  return (
    <li>
      <div className={cn(COL_CLASSES, "group items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/40")}>

        {/* ── Role: always navigates ──────────────────────────────────── */}
        <Link
          href={`/dashboard/applications/${app.id}`}
          className="group/role flex min-w-0 items-center gap-3"
        >
          <CompanyAvatar company={app.company} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[13px] font-semibold text-foreground group-hover/role:text-primary transition-colors">
                {app.jobTitle}
              </span>
              {app.jobUrl && (
                <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover/role:opacity-70 transition-opacity" />
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="truncate text-xs text-muted-foreground">{app.company}</span>
              {app.workMode && app.workMode !== "Unspecified" && (
                <>
                  <span className="text-muted-foreground/40">·</span>
                  <WorkModePill mode={app.workMode} />
                </>
              )}
            </div>
          </div>
        </Link>

        {/* ── Status: inline picker ───────────────────────────────────── */}
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <InlineStatusPicker current={app.status as ApplicationStatus} onChange={handleStatusChange} />
        </div>

        {/* ── Location: click to edit ─────────────────────────────────── */}
        <div
          className="flex min-w-0 items-center"
          onClick={(e) => { if (editingField !== "location") startEdit(e, "location"); }}
        >
          {editingField === "location" ? (
            <InlineCellInput
              value={app.location ?? ""}
              placeholder="Add location"
              onSave={saveLocation}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <button
              tabIndex={-1}
              className="group/loc flex min-w-0 items-center gap-1.5"
              onClick={(e) => startEdit(e, "location")}
            >
              {app.location ? (
                <>
                  <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="truncate text-xs text-muted-foreground group-hover/loc:text-foreground transition-colors">
                    {app.location}
                  </span>
                  <Pencil className="h-2.5 w-2.5 shrink-0 text-muted-foreground opacity-0 group-hover/loc:opacity-50 transition-opacity" />
                </>
              ) : (
                <span className="text-xs text-muted-foreground/30 group-hover/loc:text-muted-foreground transition-colors">
                  Add location
                </span>
              )}
            </button>
          )}
        </div>

        {/* ── Deadline: click to edit ─────────────────────────────────── */}
        <div
          className="flex items-center"
          onClick={(e) => { if (editingField !== "deadline") startEdit(e, "deadline"); }}
        >
          {editingField === "deadline" ? (
            <InlineCellDate
              value={app.deadline}
              onSave={saveDeadline}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <button
              tabIndex={-1}
              className="group/dl flex items-center gap-1"
              onClick={(e) => startEdit(e, "deadline")}
            >
              {app.deadline ? (
                <>
                  <CalendarClock className={cn("h-3 w-3 shrink-0", deadlinePast ? "text-destructive" : "text-muted-foreground")} />
                  <span className={cn("text-xs tabular-nums transition-colors", deadlinePast ? "text-destructive font-medium" : "text-muted-foreground group-hover/dl:text-foreground")}>
                    {format(parseISO(app.deadline), "MMM d")}
                  </span>
                  <Pencil className="h-2.5 w-2.5 shrink-0 text-muted-foreground opacity-0 group-hover/dl:opacity-50 transition-opacity" />
                </>
              ) : (
                <span className="text-xs text-muted-foreground/30 group-hover/dl:text-muted-foreground transition-colors">
                  Add date
                </span>
              )}
            </button>
          )}
        </div>

        {/* ── Updated: read-only ──────────────────────────────────────── */}
        <div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {format(parseISO(app.updatedAt), "MMM d")}
          </span>
        </div>

        {/* ── Chevron: navigate to detail ─────────────────────────────── */}
        <Link
          href={`/dashboard/applications/${app.id}`}
          className="flex justify-end"
          aria-label="Open application"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </Link>
      </div>
    </li>
  );
}

/* ─── Mobile card (< md) ─────────────────────────────────────────────────── */

function MobileApplicationCard({ app }: { app: Application }) {
  const { updateApplication } = useApplicationStore();
  const deadlinePast = app.deadline && isPast(parseISO(app.deadline));

  return (
    <li className="group">
      <Link
        href={`/dashboard/applications/${app.id}`}
        className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40 active:bg-muted/60"
      >
        <CompanyAvatar company={app.company} />

        <div className="flex-1 min-w-0">
          {/* Title + status */}
          <div className="flex items-start justify-between gap-2">
            <span className="truncate text-[13px] font-semibold text-foreground leading-snug">
              {app.jobTitle}
            </span>
            <div
              onClick={(e) => e.preventDefault()}
              className="shrink-0"
            >
              <InlineStatusPicker
                current={app.status as ApplicationStatus}
                onChange={(s) => {
                  updateApplication(app.id, { status: s });
                  toast.success(`Status → ${s}`);
                }}
              />
            </div>
          </div>

          {/* Company + location */}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="text-xs text-muted-foreground">{app.company}</span>
            {app.location && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />{app.location}
                </span>
              </>
            )}
            {app.workMode && app.workMode !== "Unspecified" && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <WorkModePill mode={app.workMode} />
              </>
            )}
          </div>

          {/* Meta row: deadline + updated */}
          <div className="mt-1.5 flex items-center gap-3">
            {app.deadline && (
              <span className={cn(
                "flex items-center gap-1 text-[11px] font-medium",
                deadlinePast ? "text-destructive" : "text-muted-foreground"
              )}>
                <CalendarClock className="h-3 w-3" />
                {format(parseISO(app.deadline), "MMM d")}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {format(parseISO(app.updatedAt), "MMM d")}
            </span>
          </div>
        </div>

        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
      </Link>
    </li>
  );
}

/* ─── Main list ──────────────────────────────────────────────────────────── */

export function ApplicationsList() {
  const mounted = useMounted();
  const { applications } = useApplicationStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const filtered = useMemo(() => {
    const base = applications.filter((app) => {
      const matchesSearch =
        !search ||
        app.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        app.company.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === ALL || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return [...base].sort((a, b) => {
      switch (sortKey) {
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "updated":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "deadline": {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }, [applications, search, statusFilter, sortKey]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => { counts[a.status] = (counts[a.status] ?? 0) + 1; });
    return counts;
  }, [applications]);

  if (!mounted) return <ApplicationsListSkeleton />;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Applications</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/dashboard/applications/new">
            <Plus className="h-3.5 w-3.5" />
            Add application
          </Link>
        </Button>
      </div>

      {/* Search + sort + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by title or company…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-8 text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="h-9 w-44 shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="updated">Recently updated</SelectItem>
            <SelectItem value="deadline">By deadline</SelectItem>
          </SelectContent>
        </Select>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0">
          {STATUS_FILTERS.map((s) => {
            const active = statusFilter === s;
            const count = s === ALL ? applications.length : (statusCounts[s] ?? 0);
            if (s !== ALL && count === 0) return null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                  active ? "bg-foreground text-background" : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                )}
              >
                {s}
                <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] tabular-nums", active ? "bg-background/20 text-background" : "bg-muted text-muted-foreground")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={search || statusFilter !== ALL ? "No matching applications" : "No applications yet"}
          description={
            search || statusFilter !== ALL
              ? "Try adjusting your search or filter."
              : "Add your first job application to start tracking your search."
          }
          action={
            !search && statusFilter === ALL ? (
              <Button size="sm" asChild>
                <Link href="/dashboard/applications/new">
                  <Plus className="h-3.5 w-3.5" /> Add application
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* ── Mobile card list (< md) ─────────────────────────────── */}
          <ul className="divide-y divide-border md:hidden">
            {filtered.map((app) => <MobileApplicationCard key={app.id} app={app} />)}
          </ul>

          {/* ── Desktop table (md+) ─────────────────────────────────── */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-[680px]">
              <div className={cn(COL_CLASSES, "items-center gap-4 border-b border-border bg-muted/40 px-4 py-2.5")}>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Role</span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Location</span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Deadline</span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Updated</span>
                <span />
              </div>
              <ul className="divide-y divide-border">
                {filtered.map((app) => <ApplicationRow key={app.id} app={app} />)}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
