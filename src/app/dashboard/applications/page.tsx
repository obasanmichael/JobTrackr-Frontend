import type { Metadata } from "next";
import { ApplicationsList } from "@/components/applications/applications-list";

export const metadata: Metadata = { title: "Applications" };

export default function ApplicationsPage() {
  return <ApplicationsList />;
}
