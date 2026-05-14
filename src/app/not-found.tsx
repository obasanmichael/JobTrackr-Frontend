import Link from "next/link";
import { BriefcaseBusiness, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <BriefcaseBusiness className="h-7 w-7 text-primary" strokeWidth={1.5} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        We couldn&apos;t find the page you&apos;re looking for. It may have been moved or deleted.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </Button>
    </div>
  );
}
