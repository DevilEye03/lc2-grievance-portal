import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ComplaintDetail } from "@/components/admin/ComplaintDetail";
import { AdminTopbar } from "@/components/layout/AdminTopbar";

export const metadata: Metadata = { title: "Complaint Detail" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({ params }: PageProps) {
  const { id } = await params;
  const headersList = await headers();
  const userName = headersList.get("x-user-name") || "Admin";

  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      statusLogs: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!complaint) notFound();

  return (
    <div>
      <AdminTopbar title="Complaint Detail" userName={userName} />
      <div className="p-3.5 sm:p-6">
        <ComplaintDetail complaint={complaint as never} userName={userName} />
      </div>
    </div>
  );
}
