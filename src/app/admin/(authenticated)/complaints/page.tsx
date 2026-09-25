import type { Metadata } from "next";
import { Suspense } from "react";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ComplaintsTable } from "@/components/admin/ComplaintsTable";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { PageSpinner } from "@/components/ui/Spinner";

export const metadata: Metadata = { title: "Complaints" };

interface PageProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    category?: string;
    type?: string;
  }>;
}

export default async function ComplaintsPage({ searchParams }: PageProps) {
  const headersList = await headers();
  const userName = headersList.get("x-user-name") || "Admin";

  const params = await searchParams;
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = 20;
  const q = params.q || "";
  const status = params.status || "";
  const category = params.category || "";
  const type = params.type || "";

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { ticketId: { contains: q } },
      { studentName: { contains: q } },
      { studentRoll: { contains: q } },
      { subject: { contains: q } },
    ];
  }
  if (status) where.status = status;
  if (category) where.category = category;
  if (type === "anonymous") where.isAnonymous = true;
  if (type === "standard") where.isAnonymous = false;

  const [complaints, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.complaint.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <AdminTopbar title="All Complaints" userName={userName} />
      <div className="p-3.5 sm:p-6">
        <Suspense fallback={<PageSpinner />}>
          <ComplaintsTable
            complaints={complaints as any}
            total={total}
            page={page}
            totalPages={totalPages}
          />
        </Suspense>
      </div>
    </div>
  );
}
