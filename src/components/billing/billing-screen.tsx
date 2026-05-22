"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Separator } from "@/components/ui/separator";
import {
  createCheckoutSession,
  createCustomerPortal,
  fetchPlans,
} from "@/features/job-seeker/billing/api/billing-api";
import { useBilling } from "@/features/job-seeker/billing/hooks/use-billing";
import {
  formatEntitlementLimit,
  formatPlanPrice,
  getBillingPageUrl,
  getFeatureLabel,
  getSubscriptionStatusLabel,
  sortPlans,
} from "@/features/job-seeker/billing/lib/billing-display";
import type { PlanSummaryApi } from "@/features/job-seeker/billing/types";
import { getApiErrorMessage } from "@/shared/lib/api-errors";

function formatWhen(value: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  const label = getSubscriptionStatusLabel(status as never);

  if (status === "BETA") {
    return (
      <Badge variant="secondary" className="bg-violet-500/10 text-violet-700 dark:text-violet-300">
        {label}
      </Badge>
    );
  }

  if (status === "PAST_DUE" || status === "EXPIRED" || status === "CANCELLED") {
    return <Badge variant="destructive">{label}</Badge>;
  }

  if (status === "TRIALING") {
    return (
      <Badge variant="secondary" className="bg-sky-500/10 text-sky-700 dark:text-sky-300">
        {label}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
      {label}
    </Badge>
  );
}

function PlanCard({
  plan,
  currentPlanCode,
  upgradingPlanCode,
  onUpgrade,
}: {
  plan: PlanSummaryApi;
  currentPlanCode: string;
  upgradingPlanCode: string | null;
  onUpgrade: (planCode: string) => void;
}) {
  const isCurrent = plan.code === currentPlanCode;
  const isUpgrading = upgradingPlanCode === plan.code;
  const canUpgrade = plan.checkoutAvailable && !isCurrent;

  return (
    <Card
      className={`flex h-full flex-col p-5 ${
        isCurrent ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : ""
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
            {plan.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
            ) : null}
          </div>
          {isCurrent ? <Badge>Current plan</Badge> : null}
          {!isCurrent && plan.isBeta ? (
            <Badge variant="secondary">Beta</Badge>
          ) : null}
        </div>

        <p className="text-2xl font-semibold tracking-tight text-foreground">
          {formatPlanPrice(plan)}
        </p>
      </div>

      <div className="mt-auto pt-5">
        {isCurrent ? (
          <Button variant="outline" className="w-full" disabled>
            Your plan
          </Button>
        ) : canUpgrade ? (
          <Button
            className="w-full"
            disabled={Boolean(upgradingPlanCode)}
            onClick={() => onUpgrade(plan.code)}
          >
            {isUpgrading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting…
              </>
            ) : (
              <>Upgrade to {plan.name}</>
            )}
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            Coming soon
          </Button>
        )}
      </div>
    </Card>
  );
}

export function BillingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const billingQuery = useBilling();

  const plansQuery = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: fetchPlans,
  });

  const checkoutMutation = useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (result) => {
      if (!result.url) {
        toast.error("Checkout is not available right now.");
        return;
      }

      window.location.href = result.url;
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const portalMutation = useMutation({
    mutationFn: createCustomerPortal,
    onSuccess: (result) => {
      window.location.href = result.url;
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  useEffect(() => {
    const checkout = searchParams.get("checkout");
    if (!checkout) {
      return;
    }

    if (checkout === "success") {
      toast.success("Subscription updated. Your plan may take a moment to refresh.");
      void queryClient.invalidateQueries({ queryKey: ["billing", "me"] });
    } else if (checkout === "cancel") {
      toast.message("Checkout cancelled, no changes were made.");
    }

    router.replace("/dashboard/billing");
  }, [queryClient, router, searchParams]);

  function handleUpgrade(planCode: string) {
    const billingUrl = getBillingPageUrl();
    checkoutMutation.mutate({
      planCode,
      successUrl: `${billingUrl}?checkout=success`,
      cancelUrl: `${billingUrl}?checkout=cancel`,
    });
  }

  function handleManageBilling() {
    portalMutation.mutate({
      returnUrl: getBillingPageUrl(),
    });
  }

  if (billingQuery.isLoading || plansQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading billing…
      </div>
    );
  }

  if (billingQuery.isError) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Billing"
          description="Your plan, entitlements, and subscription settings."
        />
        <EmptyState
          icon={CreditCard}
          title="Could not load billing"
          description={getApiErrorMessage(billingQuery.error)}
          action={
            <Button variant="secondary" size="sm" onClick={() => billingQuery.refetch()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  const billing = billingQuery.data!;
  const plans = sortPlans(plansQuery.data ?? []);
  const periodEnd = formatWhen(billing.currentPeriodEnd);
  const isBetaPlan = billing.planCode === "BETA_FREE" || billing.subscriptionStatus === "BETA";
  const canManageBilling =
    billing.stripeConfigured && Boolean(billing.stripeCustomerId);
  const upgradingPlanCode = checkoutMutation.isPending
    ? checkoutMutation.variables?.planCode ?? null
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Your plan, entitlements, and subscription settings."
        action={
          canManageBilling ? (
            <Button
              variant="outline"
              size="sm"
              disabled={portalMutation.isPending}
              onClick={handleManageBilling}
            >
              {portalMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="mr-2 h-4 w-4" />
              )}
              Manage subscription
            </Button>
          ) : undefined
        }
      />

      {isBetaPlan ? (
        <Card className="border-violet-500/20 bg-violet-500/5 p-5">
          <div className="flex gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-violet-600 dark:text-violet-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Free during beta</p>
              <p className="text-sm text-muted-foreground">
                JobTrackr is free while we&apos;re in beta. You have full access to current
                features, no payment required. Paid plans below will be available when billing
                opens.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card className="p-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current plan
                </p>
                <h2 className="mt-1 text-xl font-semibold text-foreground">{billing.planName}</h2>
              </div>
              <SubscriptionStatusBadge status={billing.subscriptionStatus} />
            </div>

            <Separator />

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Billing provider</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {billing.billingProvider === "STRIPE" ? "Stripe" : "None (beta)"}
                </dd>
              </div>
              {periodEnd ? (
                <div>
                  <dt className="text-muted-foreground">Current period ends</dt>
                  <dd className="mt-0.5 font-medium text-foreground">{periodEnd}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">Stripe checkout</dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {billing.stripeConfigured ? "Available" : "Not configured"}
                </dd>
              </div>
            </dl>
          </div>
        </Card>

        <Card className="p-5">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Feature access</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                What your plan includes today.
              </p>
            </div>

            <ul className="space-y-3">
              {billing.entitlements.map((entitlement) => (
                <li
                  key={entitlement.featureKey}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="flex items-start gap-2">
                    {entitlement.isEnabled ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span
                      className={
                        entitlement.isEnabled ? "text-foreground" : "text-muted-foreground"
                      }
                    >
                      {getFeatureLabel(entitlement.featureKey)}
                    </span>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {entitlement.isEnabled
                      ? formatEntitlementLimit(entitlement)
                      : "Not included"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-foreground">Available plans</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Compare tiers and upgrade when checkout is enabled for your account.
          </p>
        </div>

        {plansQuery.isError ? (
          <EmptyState
            icon={CreditCard}
            title="Could not load plans"
            description={getApiErrorMessage(plansQuery.error)}
            action={
              <Button variant="secondary" size="sm" onClick={() => plansQuery.refetch()}>
                Retry
              </Button>
            }
          />
        ) : plans.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No plans available"
            description="Plan catalog has not been configured yet."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.code}
                plan={plan}
                currentPlanCode={billing.planCode}
                upgradingPlanCode={upgradingPlanCode}
                onUpgrade={handleUpgrade}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
