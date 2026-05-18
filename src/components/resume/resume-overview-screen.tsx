"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  CheckCircle2,
  MoreHorizontal,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ResumeUploadZone } from "@/components/resume/resume-upload-zone";
import { ResumeStatusBadge } from "@/components/resume/resume-status-badge";
import {
  deleteResume,
  listResumes,
  postResumeSetActive,
  postResumeUnarchive,
  updateResume,
  uploadResumeFile,
} from "@/features/job-seeker/resume/api/resumes-api";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { cn } from "@/lib/utils";
import type { Resume } from "@/types";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

interface ResumeRowProps {
  resume: Resume;
  listKind: "library" | "archived";
  onSetActive?: (id: string) => void;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onDelete: (id: string) => void;
  busy: boolean;
}

function ResumeRow({
  resume,
  listKind,
  onSetActive,
  onArchive,
  onUnarchive,
  onDelete,
  busy,
}: ResumeRowProps) {
  const isParsing = resume.status === "PARSING" || resume.status === "UPLOADED";
  const isArchived = resume.status === "ARCHIVED";
  const inLibrary = listKind === "library";

  return (
    <Card className="flex flex-col gap-3 border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{resume.fileName}</p>
          <ResumeStatusBadge status={resume.status} />
          {resume.isActive && !isArchived && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-800 dark:bg-violet-950/60 dark:text-violet-300">
              <Star className="h-3 w-3 fill-current" />
              Active for matching
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {formatBytes(resume.fileSize)}
          {" · "}
          Updated {format(parseISO(resume.updatedAt), "MMM d, yyyy")}
        </p>
        {resume.status === "FAILED" && resume.parseError && (
          <p className="text-xs text-red-700 dark:text-red-400">{resume.parseError}</p>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {isParsing ? (
          <Button variant="outline" size="sm" disabled title="Parsing in progress">
            View profile
          </Button>
        ) : (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/resume/${resume.id}`}>View profile</Link>
          </Button>
        )}
        {inLibrary && (
          <Button
            variant="secondary"
            size="sm"
            disabled={busy || isParsing || isArchived || resume.isActive}
            onClick={() => onSetActive?.(resume.id)}
          >
            Use for matching
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" aria-label="More actions" disabled={busy}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {inLibrary ? (
              <>
                <DropdownMenuItem
                  disabled={isArchived || isParsing || busy}
                  onClick={() => onArchive?.(resume.id)}
                  className="gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Archive resume
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            ) : (
              <>
                <DropdownMenuItem
                  disabled={busy}
                  onClick={() => onUnarchive?.(resume.id)}
                  className="gap-2"
                >
                  <ArchiveRestore className="h-4 w-4" />
                  Unarchive resume
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              disabled={busy}
              onClick={() => onDelete(resume.id)}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

export function ResumeOverviewScreen() {
  const queryClient = useQueryClient();

  const {
    data: resumes,
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["resumes"],
    queryFn: listResumes,
  });

  const libraryResumes = useMemo(
    () => resumes?.filter((r) => r.status !== "ARCHIVED") ?? [],
    [resumes]
  );

  const archivedResumes = useMemo(
    () => resumes?.filter((r) => r.status === "ARCHIVED") ?? [],
    [resumes]
  );

  const uploadMutation = useMutation({
    mutationFn: uploadResumeFile,
    onSuccess: () => {
      toast.success("Resume uploaded.");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : getApiErrorMessage(e);
      toast.error(msg);
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: (resumeId: string) => postResumeSetActive(resumeId),
    onSuccess: () => {
      toast.success("Active resume updated.");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e)),
  });

  const unarchiveMutation = useMutation({
    mutationFn: (resumeId: string) => postResumeUnarchive(resumeId),
    onSuccess: (_, resumeId) => {
      toast.success("Resume restored to your library.");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resume", resumeId] });
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e)),
  });

  const archiveMutation = useMutation({
    mutationFn: (resumeId: string) => updateResume(resumeId, { status: "ARCHIVED" }),
    onSuccess: (_, resumeId) => {
      toast.success("Resume archived.");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resume", resumeId] });
      queryClient.removeQueries({ queryKey: ["resume-profile", resumeId] });
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (resumeId: string) => deleteResume(resumeId),
    onSuccess: (_, resumeId) => {
      toast.success("Resume deleted.");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.removeQueries({ queryKey: ["resume", resumeId] });
      queryClient.removeQueries({ queryKey: ["resume-profile", resumeId] });
    },
    onError: (e: unknown) => toast.error(getApiErrorMessage(e)),
  });

  const resumeMutationBusy =
    uploadMutation.isPending ||
    setActiveMutation.isPending ||
    unarchiveMutation.isPending ||
    archiveMutation.isPending ||
    deleteMutation.isPending;

  const activeResume = resumes?.find((r) => r.isActive && r.status !== "ARCHIVED");

  type DestructiveAction = { kind: "archive" | "delete"; resumeId: string };
  const [destructiveConfirm, setDestructiveConfirm] = useState<DestructiveAction | null>(null);

  const destructivePending = archiveMutation.isPending || deleteMutation.isPending;

  function requestArchive(id: string) {
    setDestructiveConfirm({ kind: "archive", resumeId: id });
  }

  function requestDelete(id: string) {
    setDestructiveConfirm({ kind: "delete", resumeId: id });
  }

  function closeDestructiveConfirm() {
    setDestructiveConfirm(null);
  }

  function confirmDestructive() {
    if (!destructiveConfirm) return;
    if (destructiveConfirm.kind === "archive") {
      archiveMutation.mutate(destructiveConfirm.resumeId, {
        onSettled: () => closeDestructiveConfirm(),
      });
    } else {
      deleteMutation.mutate(destructiveConfirm.resumeId, {
        onSettled: () => closeDestructiveConfirm(),
      });
    }
  }

  const hasAnyResumes = (resumes?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Resume"
        description="Upload and manage resumes, review parsed details, and run AI-guided improvements."
        action={
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/dashboard/resume/review" className="gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              AI resume review
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Active resume</h3>
            <p className="text-sm text-muted-foreground">
              Matching uses the resume you mark active (<code className="text-xs">POST /set-active</code>
              ).
            </p>
          </div>
          <Card className="border-border/80 bg-card p-5">
            {activeResume ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{activeResume.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      <ResumeStatusBadge status={activeResume.status} className="mr-2 align-middle" />
                      Parsing must finish before edits.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/resume/${activeResume.id}`}>Review profile</Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/dashboard/resume/review">Open AI review</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={AlertCircle}
                title="No active resume"
                description='Upload a resume and choose "Use for matching" once parsing completes.'
              />
            )}
          </Card>
        </div>

        <div>
          <ResumeUploadZone
            isUploading={uploadMutation.isPending}
            disabled={resumeMutationBusy}
            onFileSelected={(file) => uploadMutation.mutate(file)}
          />
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Your resumes</h3>
            <p className="text-sm text-muted-foreground">
              Current library — excludes archived files. Parse state and profile edits stay with each
              version.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            disabled={isPending || resumeMutationBusy}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </div>

        {isPending ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className={cn("h-[88px] rounded-xl bg-muted animate-pulse")} />
            ))}
          </div>
        ) : isError ? (
          <Card className="border-destructive/40 p-6 text-sm text-destructive">
            {getApiErrorMessage(error)}{" "}
            <button type="button" className="underline" onClick={() => refetch()}>
              Retry
            </button>
          </Card>
        ) : !hasAnyResumes ? (
          <EmptyState title="No resumes yet" description="Upload your first CV to get started." />
        ) : libraryResumes.length === 0 ? (
          <EmptyState
            title="No resumes in your library"
            description="Everything you have is archived below, or upload a new file."
          />
        ) : (
          <div className="space-y-3">
            {libraryResumes.map((resume) => (
              <ResumeRow
                key={resume.id}
                listKind="library"
                resume={resume}
                busy={resumeMutationBusy}
                onSetActive={(rid) => setActiveMutation.mutate(rid)}
                onArchive={requestArchive}
                onDelete={requestDelete}
              />
            ))}
          </div>
        )}
      </section>

      {archivedResumes.length > 0 && (
        <section className="space-y-3 border-t border-border/80 pt-8">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Archived</h3>
            <p className="text-sm text-muted-foreground">
              Hidden from matching and your main list. Unarchive to restore the previous parse state,
              or delete permanently.
            </p>
          </div>
          <div className="space-y-3">
            {archivedResumes.map((resume) => (
              <ResumeRow
                key={resume.id}
                listKind="archived"
                resume={resume}
                busy={resumeMutationBusy}
                onUnarchive={(rid) => unarchiveMutation.mutate(rid)}
                onDelete={requestDelete}
              />
            ))}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={destructiveConfirm !== null}
        onOpenChange={(open) => {
          if (!open && !destructivePending) closeDestructiveConfirm();
        }}
        title={
          destructiveConfirm?.kind === "delete"
            ? "Delete this resume?"
            : "Archive this resume?"
        }
        description={
          destructiveConfirm?.kind === "delete"
            ? "This removes the file and candidate profile from JobTrackr permanently. You cannot undo this action."
            : "Archived resumes are removed from matching. You can still view this record until you delete it."
        }
        confirmLabel={
          destructiveConfirm?.kind === "delete" ? "Delete permanently" : "Archive resume"
        }
        cancelLabel="Cancel"
        variant={destructiveConfirm?.kind === "delete" ? "destructive" : "default"}
        isPending={destructivePending}
        onConfirm={confirmDestructive}
      />
    </div>
  );
}
