"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BriefcaseBusiness, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { resetPasswordRequest } from "@/features/auth/api/auth-api";
import { saveSession } from "@/features/auth/lib/session-storage";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof schema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(schema),
  });

  async function onSubmit({ newPassword }: ResetPasswordForm) {
    if (!token) {
      toast.error("This reset link is invalid. Request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      const session = await resetPasswordRequest({
        token,
        newPassword,
      });
      saveSession(session.accessToken, session.user);
      toast.success("Password updated. You are signed in.");
      window.location.assign("/dashboard");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-8 py-12">
        <div className="w-full max-w-[360px] space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Invalid reset link
          </h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is missing or malformed. Request a new one.
          </p>
          <Button asChild className="w-full h-10">
            <Link href="/forgot-password">Request reset link</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-8 py-12">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <BriefcaseBusiness className="h-4 w-4 text-white" />
        </div>
        <span className="text-[13px] font-semibold text-foreground">JobTrackr</span>
      </div>

      <div className="w-full max-w-[360px]">
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Choose a new password
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter a new password for your JobTrackr account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-[13px]">
              New password
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-10 pr-10"
                {...register("newPassword")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.newPassword ? (
              <p className="text-xs text-destructive">
                {errors.newPassword.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-[13px]">
              Confirm password
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                className="h-10 pr-10"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <Button type="submit" className="w-full h-10" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Saving…" : "Update password"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-foreground hover:text-primary transition-colors"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
