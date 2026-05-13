import type { Metadata } from "next";

export const metadata: Metadata = { title: "Reminders" };

export default function RemindersPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">Reminders</h2>
        <p className="text-sm text-muted-foreground">
          Keep track of follow-ups and important dates.
        </p>
      </div>
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-sm text-muted-foreground">Reminders — coming in Stage 3</p>
      </div>
    </div>
  );
}
