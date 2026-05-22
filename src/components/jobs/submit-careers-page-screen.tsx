"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Building2, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createJobSourceSubmission } from "@/features/job-seeker/job-source-submissions/api/job-source-submissions-api";
import type { JobSourceSubmission } from "@/features/job-seeker/job-source-submissions/types";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getApiErrorMessage } from "@/shared/lib/api-errors";

const submitCareersPageSchema = z.object({
  companyName: z.string().min(1, "Company name is required").max(200),
  careersUrl: z.string().url("Enter a valid careers page URL"),
  submitterEmail: z
    .union([z.string().email("Enter a valid email address"), z.literal("")])
    .optional(),
});

type SubmitCareersPageForm = z.infer<typeof submitCareersPageSchema>;

function formatAtsLabel(atsType: string | null): string | null {
  if (!atsType) return null;
  return atsType.charAt(0) + atsType.slice(1).toLowerCase();
}

function SubmissionSuccessCard(props: {
  submission: JobSourceSubmission;
  onSubmitAnother: () => void;
}) {
  const { submission } = props;
  const atsLabel = formatAtsLabel(submission.detectedAtsType);

  return (
    <Card className="space-y-4 border-border/80 p-5">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            Thanks, your submission is in review
          </p>
          <p className="text-sm text-muted-foreground">
            We received <strong>{submission.companyName}</strong> and will queue
            it for admin review before syncing jobs into JobTrackr.
          </p>
          {atsLabel && submission.detectedSlug ? (
            <p className="text-sm text-muted-foreground">
              Detected {atsLabel} board:{" "}
              <span className="font-medium text-foreground">
                {submission.detectedSlug}
              </span>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              We could not auto-detect a supported ATS from this URL. An admin
              will review it manually.
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={props.onSubmitAnother}>
          Submit another
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/jobs">Back to jobs</Link>
        </Button>
      </div>
    </Card>
  );
}

export function SubmitCareersPageScreen() {
  const { user } = useAuth();
  const [completedSubmission, setCompletedSubmission] =
    useState<JobSourceSubmission | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SubmitCareersPageForm>({
    resolver: zodResolver(submitCareersPageSchema),
    defaultValues: {
      companyName: "",
      careersUrl: "",
      submitterEmail: user?.email ?? "",
    },
  });

  useEffect(() => {
    if (user?.email) {
      setValue("submitterEmail", user.email);
    }
  }, [user?.email, setValue]);

  const submitMutation = useMutation({
    mutationFn: createJobSourceSubmission,
    onSuccess: (submission) => {
      setCompletedSubmission(submission);
      toast.success("Careers page submitted for review");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  async function onSubmit(data: SubmitCareersPageForm) {
    await submitMutation.mutateAsync({
      companyName: data.companyName.trim(),
      careersUrl: data.careersUrl.trim(),
      ...(data.submitterEmail?.trim()
        ? { submitterEmail: data.submitterEmail.trim() }
        : {}),
    });
  }

  function submitAnother() {
    setCompletedSubmission(null);
    reset({
      companyName: "",
      careersUrl: "",
      submitterEmail: user?.email ?? "",
    });
  }

  if (completedSubmission) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Submit a careers page"
          description="Help expand JobTrackr’s job board coverage by suggesting company ATS pages."
        />
        <SubmissionSuccessCard
          submission={completedSubmission}
          onSubmitAnother={submitAnother}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Submit a careers page"
        description="Suggest a company job board (Greenhouse, Lever, Ashby, or other). We auto-detect supported ATS URLs and queue them for review."
      />

      <Card className="space-y-5 border-border/80 p-5">
        <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/30 p-4">
          <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Paste the public careers or jobs listing URL. Duplicate pending
            submissions for the same URL are rejected. Supported hosts include{" "}
            <code className="text-xs">boards.greenhouse.io</code>,{" "}
            <code className="text-xs">jobs.lever.co</code>, and{" "}
            <code className="text-xs">jobs.ashbyhq.com</code>.
          </p>
        </div>

        <form
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="company-name">Company name</Label>
            <Input
              id="company-name"
              placeholder="Acme Corp"
              {...register("companyName")}
            />
            {errors.companyName ? (
              <p className="text-xs text-destructive">
                {errors.companyName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="careers-url">Careers page URL</Label>
            <Input
              id="careers-url"
              type="url"
              placeholder="https://boards.greenhouse.io/acme"
              {...register("careersUrl")}
            />
            {errors.careersUrl ? (
              <p className="text-xs text-destructive">
                {errors.careersUrl.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="submitter-email">Your email (optional)</Label>
            <Input
              id="submitter-email"
              type="email"
              placeholder="you@example.com"
              {...register("submitterEmail")}
            />
            {errors.submitterEmail ? (
              <p className="text-xs text-destructive">
                {errors.submitterEmail.message}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              {user
                ? "We prefilled your account email. You can change it or leave blank."
                : "Optional contact email if we need follow-up."}
            </p>
          </div>

          <Button type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit for review"
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
