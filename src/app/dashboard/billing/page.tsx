import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { BillingScreen } from "@/components/billing/billing-screen";

function BillingLoadingFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading billing…
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingLoadingFallback />}>
      <BillingScreen />
    </Suspense>
  );
}
