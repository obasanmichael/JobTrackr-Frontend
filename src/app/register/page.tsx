"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, BriefcaseBusiness } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { getApiErrorMessage } from "@/shared/lib/api-errors";
import { getSafeInternalRedirectPath } from "@/shared/lib/safe-redirect-path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
type RegisterForm = z.infer<typeof registerSchema>;

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register: registerUser, user, ready } = useAuth();

  useEffect(() => {
    if (ready && user) {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit({ name, email, password }: RegisterForm) {
    setIsLoading(true);
    try {
      const next = getSafeInternalRedirectPath(searchParams.get("next"));
      await registerUser({ name, email, password }, next);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-sidebar p-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/20">
            <BriefcaseBusiness className="h-4 w-4 text-sidebar-primary" />
          </div>
          <span className="text-[13px] font-semibold text-white/90">JobTrackr</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-sidebar-accent px-3 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-sidebar-foreground">Free during beta</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white/90 leading-snug">
              Your personal job search CRM
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-sidebar-foreground">
              Track applications, interviews, follow-ups, and outcomes — all in one organised dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-col items-center justify-center bg-background px-8 py-12">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BriefcaseBusiness className="h-4 w-4 text-white" />
          </div>
          <span className="text-[13px] font-semibold text-foreground">JobTrackr</span>
        </div>

        <div className="w-full max-w-[360px]">
          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Create an account
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Start tracking your job search for free
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[13px]">Full name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Alex Johnson"
                className="h-10"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[13px]">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="h-10"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[13px]">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className="h-10 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[13px]">Confirm password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  className="h-10 pr-10"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-10" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
