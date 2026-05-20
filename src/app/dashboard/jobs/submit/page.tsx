import type { Metadata } from "next";
import { SubmitCareersPageScreen } from "@/components/jobs/submit-careers-page-screen";

export const metadata: Metadata = { title: "Submit careers page" };

export default function Page() {
  return <SubmitCareersPageScreen />;
}
