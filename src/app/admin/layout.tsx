import type { Metadata } from "next";
import { AdminAppShell } from "@/features/admin/components/admin-app-shell";
import { AuthGuard } from "@/features/auth";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AdminAppShell>{children}</AdminAppShell>
    </AuthGuard>
  );
}
