import { Suspense } from "react";
import { CardStackSkeleton } from "@/components/ui/page-skeletons";
import { BillingScreen } from "@/components/billing/billing-screen";

function BillingLoadingFallback() {
  return <CardStackSkeleton label="Loading billing" headerAction />;
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingLoadingFallback />}>
      <BillingScreen />
    </Suspense>
  );
}
