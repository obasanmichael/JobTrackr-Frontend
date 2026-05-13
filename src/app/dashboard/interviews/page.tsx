import type { Metadata } from "next";

export const metadata: Metadata = { title: "Interviews" };

export default function InterviewsPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Interviews</h2>
        <p className="text-sm text-muted-foreground">
          Manage all your interview stages and notes.
        </p>
      </div>
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">Interviews — coming in Stage 3</p>
      </div>
    </div>
  );
}
