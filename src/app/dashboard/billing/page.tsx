import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { CreditCard } from "lucide-react";

export default function BillingPlaceholderPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Plan, entitlements, and beta status will surface once billing endpoints expose live data."
      />
      <EmptyState
        icon={CreditCard}
        title="Beta access"
        description="JobTrackr is free during beta. Future paid tiers and usage limits appear here alongside feature entitlements like AI review quotas."
      />
    </div>
  );
}
