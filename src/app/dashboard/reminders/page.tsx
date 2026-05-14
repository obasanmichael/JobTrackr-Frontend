import type { Metadata } from "next";
import { RemindersPage } from "@/components/reminders/reminders-page";

export const metadata: Metadata = { title: "Reminders" };

export default function Page() {
  return <RemindersPage />;
}
