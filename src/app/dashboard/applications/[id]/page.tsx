import type { Metadata } from "next";
import { ApplicationDetail } from "@/components/applications/application-detail";

export const metadata: Metadata = { title: "Application" };

export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  return <ApplicationDetail id={params.id} />;
}
