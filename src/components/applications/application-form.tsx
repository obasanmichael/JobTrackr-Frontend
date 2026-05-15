"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useApplicationStore } from "@/hooks/useApplicationStore";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPLICATION_STATUSES,
  WORK_MODES,
  JOB_SOURCES,
  CURRENCIES,
} from "@/lib/constants";
import type { Application } from "@/types";

const formSchema = z
  .object({
    jobTitle: z.string().min(1, "Job title is required"),
    company: z.string().min(1, "Company is required"),
    status: z.enum(APPLICATION_STATUSES),
    jobUrl: z.string().url("Enter a valid URL").or(z.literal("")).optional(),
    location: z.string().optional(),
    workMode: z.enum(WORK_MODES).optional(),
    salaryMin: z.string().optional(),
    salaryMax: z.string().optional(),
    currency: z.enum(CURRENCIES).optional(),
    source: z.enum(JOB_SOURCES).optional(),
    deadline: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (d) => {
      const min = d.salaryMin ? Number(d.salaryMin) : 0;
      const max = d.salaryMax ? Number(d.salaryMax) : 0;
      if (min && max && min > max) return false;
      return true;
    },
    { message: "Min salary cannot be greater than max", path: ["salaryMin"] }
  );

type FormData = z.infer<typeof formSchema>;

interface ApplicationFormProps {
  existing?: Application;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function FieldGroup({ children, cols = 1 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div className={`grid gap-4 ${cols === 2 ? "sm:grid-cols-2" : cols === 3 ? "sm:grid-cols-3" : ""}`}>
      {children}
    </div>
  );
}

function FieldItem({ label, required, error, children }: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[13px]">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function ApplicationForm({ existing }: ApplicationFormProps) {
  const router = useRouter();
  const { createApplication, updateApplication } = useApplicationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: existing
      ? {
          jobTitle: existing.jobTitle,
          company: existing.company,
          status: existing.status,
          jobUrl: existing.jobUrl ?? "",
          location: existing.location ?? "",
          workMode: existing.workMode,
          salaryMin: existing.salaryMin ? String(existing.salaryMin) : "",
          salaryMax: existing.salaryMax ? String(existing.salaryMax) : "",
          currency: existing.currency,
          source: existing.source,
          deadline: existing.deadline
            ? existing.deadline.slice(0, 10)
            : "",
          notes: existing.notes ?? "",
        }
      : { status: "Applied" },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const status = watch("status");

  async function onSubmit(rawData: unknown) {
    const data = rawData as FormData;
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        salaryMin: data.salaryMin ? Number(data.salaryMin) : undefined,
        salaryMax: data.salaryMax ? Number(data.salaryMax) : undefined,
        jobUrl: data.jobUrl || undefined,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
      };
      if (existing) {
        await updateApplication(existing.id, payload);
        toast.success("Application updated");
        router.push(`/dashboard/applications/${existing.id}`);
      } else {
        const app = await createApplication(payload);
        toast.success("Application added");
        router.push(`/dashboard/applications/${app.id}`);
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEdit = Boolean(existing);

  return (
    <div className="max-w-2xl">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground" asChild>
          <Link href="/dashboard/applications">
            <ArrowLeft className="h-3.5 w-3.5" />
            Applications
          </Link>
        </Button>
        <span className="text-muted-foreground/40">/</span>
        <span className="text-[13px] font-medium text-foreground">
          {isEdit ? "Edit application" : "Add application"}
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          {isEdit ? "Edit application" : "Add new application"}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {isEdit
            ? "Update the details of this job application."
            : "Track a new job opportunity in your search."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        {/* Required info */}
        <div className="rounded-xl border border-border p-5 space-y-5">
          <FormSection title="Required information">
            <FieldGroup cols={2}>
              <FieldItem label="Job title" required error={errors.jobTitle?.message}>
                <Input
                  placeholder="e.g. Senior Frontend Engineer"
                  {...register("jobTitle")}
                />
              </FieldItem>
              <FieldItem label="Company" required error={errors.company?.message}>
                <Input placeholder="e.g. Stripe" {...register("company")} />
              </FieldItem>
            </FieldGroup>

            <FieldItem label="Status" required error={errors.status?.message}>
              <Select
                value={status}
                onValueChange={(v) => setValue("status", v as typeof status)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldItem>
          </FormSection>
        </div>

        {/* Job details */}
        <div className="rounded-xl border border-border p-5 space-y-5">
          <FormSection title="Job details">
            <FieldItem label="Job URL" error={errors.jobUrl?.message}>
              <Input
                type="url"
                placeholder="https://company.com/careers/role"
                {...register("jobUrl")}
              />
            </FieldItem>

            <FieldGroup cols={2}>
              <FieldItem label="Location">
                <Input placeholder="e.g. London, UK" {...register("location")} />
              </FieldItem>
              <FieldItem label="Work mode">
                <Select
                  value={watch("workMode")}
                  onValueChange={(v) => setValue("workMode", v as typeof WORK_MODES[number])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_MODES.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldItem>
            </FieldGroup>

            <FieldGroup cols={2}>
              <FieldItem label="Source">
                <Select
                  value={watch("source")}
                  onValueChange={(v) => setValue("source", v as typeof JOB_SOURCES[number])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How did you find it?" />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_SOURCES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldItem>
              <FieldItem label="Application deadline">
                <Input type="date" {...register("deadline")} />
              </FieldItem>
            </FieldGroup>
          </FormSection>
        </div>

        {/* Compensation */}
        <div className="rounded-xl border border-border p-5 space-y-5">
          <FormSection title="Compensation">
            <FieldGroup cols={3}>
              <FieldItem label="Min salary" error={errors.salaryMin?.message}>
                <Input
                  type="number"
                  placeholder="60,000"
                  min={0}
                  {...register("salaryMin")}
                />
              </FieldItem>
              <FieldItem label="Max salary">
                <Input
                  type="number"
                  placeholder="80,000"
                  min={0}
                  {...register("salaryMax")}
                />
              </FieldItem>
              <FieldItem label="Currency">
                <Select
                  value={watch("currency")}
                  onValueChange={(v) => setValue("currency", v as typeof CURRENCIES[number])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldItem>
            </FieldGroup>
          </FormSection>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-border p-5 space-y-5">
          <FormSection title="Notes">
            <FieldItem label="Notes">
              <Textarea
                placeholder="Any notes about this role, recruiter contact, impressions…"
                rows={4}
                {...register("notes")}
              />
            </FieldItem>
          </FormSection>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <Button variant="outline" type="button" asChild>
            <Link href={existing ? `/dashboard/applications/${existing.id}` : "/dashboard/applications"}>
              Cancel
            </Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save changes" : "Add application"}
          </Button>
        </div>
      </form>
    </div>
  );
}
