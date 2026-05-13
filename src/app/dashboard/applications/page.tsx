import type { Metadata } from "next";

export const metadata: Metadata = { title: "Applications" };

export default function ApplicationsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Applications</h2>
        <p className="text-sm text-muted-foreground">
          Track all your job applications in one place.
        </p>
      </div>
      {/* ApplicationsList component will be added in Stage 2 */}
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">Applications list — coming in Stage 2</p>
      </div>
    </div>
  );
}
