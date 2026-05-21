import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { AdminSubscriptionsScreen } from "@/components/admin/admin-subscriptions-screen";

function SubscriptionsFallback() {
  return (
    <div className="flex justify-center py-24 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
    </div>
  );
}

export default function AdminSubscriptionsPage() {
  return (
    <Suspense fallback={<SubscriptionsFallback />}>
      <AdminSubscriptionsScreen />
    </Suspense>
  );
}
