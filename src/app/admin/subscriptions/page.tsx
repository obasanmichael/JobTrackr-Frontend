import { Suspense } from "react";
import { CardStackSkeleton } from "@/components/ui/page-skeletons";
import { AdminSubscriptionsScreen } from "@/components/admin/admin-subscriptions-screen";

function SubscriptionsFallback() {
  return <CardStackSkeleton count={2} label="Loading subscriptions" />;
}

export default function AdminSubscriptionsPage() {
  return (
    <Suspense fallback={<SubscriptionsFallback />}>
      <AdminSubscriptionsScreen />
    </Suspense>
  );
}
