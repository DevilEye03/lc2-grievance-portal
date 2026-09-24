import type { Metadata } from "next";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { Badge, SLABadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { getSLAStatus, avgResolutionDays, formatDate } from "@/lib/sla";
import Link from "next/link";
import { Eye, ChevronRight } from "lucide-react";
import type { DashboardStats as Stats } from "@/types";

import { unstable_cache } from "next/cache";

export const metadata: Metadata = { title: "Dashboard" };

const getCachedDashboardData = unstable_cache(
  async (): Promise<Stats> => getDashboardData(),
  ["admin-dashboard-stats-v1"],
  { revalidate: 30, tags: ["dashboard-stats"] }
);

async function getDashboardData(): Promise<Stats> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const allComplaints = await prisma.complaint.findMany({
    select: {
      status: true,
      category: true,
      slaDueDate: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const thisMonth = allComplaints.filter((c) => new Date(c.createdAt) >= startOfMonth).length;

  const activePending = allComplaints.filter(
    (c) => c.status === "REGISTERED" || c.status === "IN_PROGRESS" || c.status === "ACKNOWLEDGED"
  ).length;

  const slaBreached = allComplaints.filter(
    (c) =>
      getSLAStatus(new Date(c.slaDueDate), c.status) === "breached"
  ).length;

  const byCategory: Record<string, number> = {};
  const byStatus: Record<string, number> = {};

  for (const c of allComplaints) {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
  }

  return {
    totalThisMonth: thisMonth,
    activePending,
    slaBreached,
    avgResolutionDays: avgResolutionDays(
      allComplaints.map((c) => ({
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        status: c.status,
      }))
    ),
    byCategory,
    byStatus,
  };
}

export default async function DashboardPage() {
  const headersList = await headers();
  const userName = headersList.get("x-user-name") || "Admin";

  const [stats, recentComplaints] = await Promise.all([
    getCachedDashboardData(),
    prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        ticketId: true,
        studentName: true,
        studentRoll: true,
        category: true,
        status: true,
        slaDueDate: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div>
      <AdminTopbar title="Dashboard" userName={userName} />
      <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6">
        <DashboardStats stats={stats} />

        {/* Recent Complaints */}
        <Card padding="none">
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-wider">
              Recent Complaints
            </h3>
            <Link
              href="/admin/complaints"
              className="text-xs sm:text-sm text-brand-600 hover:text-brand-800 font-semibold flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Mobile Recent Complaints List (< sm) */}
          <div className="sm:hidden divide-y divide-gray-100">
            {recentComplaints.map((c) => {
              const sla = getSLAStatus(new Date(c.slaDueDate), c.status);
              return (
                <Link
                  key={c.id}
                  href={`/admin/complaints/${c.id}`}
                  className={`p-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors block ${
                    sla === "breached" ? "bg-rose-50/60" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-brand-700">
                        {c.ticketId}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {formatDate(c.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 truncate">{c.studentName}</p>
                    <p className="text-[11px] text-gray-500">{c.studentRoll}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge status={c.status} />
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop Table (hidden sm:block) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Ticket ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                    Filed
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">
                    SLA
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentComplaints.map((c) => {
                  const sla = getSLAStatus(new Date(c.slaDueDate), c.status);
                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        sla === "breached" ? "bg-rose-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-brand-700">
                        {c.ticketId}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900">{c.studentName}</p>
                        <p className="text-xs text-gray-500">{c.studentRoll}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge status={c.status} />
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <SLABadge slaDueDate={c.slaDueDate} status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/admin/complaints/${c.id}`}>
                          <span className="inline-flex items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                            <Eye className="h-4 w-4" />
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
