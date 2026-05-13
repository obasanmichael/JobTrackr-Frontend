import type { Metadata } from "next";
import { ApplicationForm } from "@/components/applications/application-form";

export const metadata: Metadata = { title: "Add Application" };

export default function NewApplicationPage() {
  return <ApplicationForm />;
}
