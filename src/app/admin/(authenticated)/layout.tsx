import { headers } from "next/headers";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userName = headersList.get("x-user-name") || "Admin";
  const userRole = headersList.get("x-user-role") || "OFFICER";

  return (
    <AdminShell userName={userName} userRole={userRole}>
      {children}
    </AdminShell>
  );
}
