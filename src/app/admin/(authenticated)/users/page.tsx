import type { Metadata } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { UserTable } from "@/components/admin/UserTable";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "User Management" };

export default async function UsersPage() {
  const headersList = await headers();
  const userName = headersList.get("x-user-name") || "Admin";
  const userRole = headersList.get("x-user-role") || "";
  const userId = headersList.get("x-user-id") || "";

  // Only SUPER_ADMIN can access this page
  if (userRole !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div>
      <AdminTopbar title="User Management" userName={userName} />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Admin Users</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage portal administrators. Only SUPER_ADMIN can access this section.
          </p>
        </div>
        <UserTable users={users as never} currentUserId={userId} />
      </div>
    </div>
  );
}
