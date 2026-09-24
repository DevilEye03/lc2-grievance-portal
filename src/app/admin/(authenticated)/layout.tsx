import { headers } from "next/headers";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userName = headersList.get("x-user-name") || "Admin";
  const userRole = headersList.get("x-user-role") || "OFFICER";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar userName={userName} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
