"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Badge, SLABadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { CATEGORIES, STATUSES } from "@/lib/validations";
import { formatDate } from "@/lib/sla";
import type { Complaint } from "@/types";
import { Search, Download, Eye, ChevronLeft, ChevronRight, Filter, Calendar, User, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplaintsTableProps {
  complaints: Complaint[];
  total: number;
  page: number;
  totalPages: number;
}

export function ComplaintsTable({ complaints, total, page, totalPages }: ComplaintsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [exporting, setExporting] = useState(false);

  function buildQuery(params: Record<string, string | undefined>) {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === "") current.delete(k);
      else current.set(k, v);
    });
    return current.toString();
  }

  function handleFilter(key: string, value: string) {
    router.push(`${pathname}?${buildQuery({ [key]: value, page: "1" })}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`${pathname}?${buildQuery({ q: search, page: "1" })}`);
  }

  async function handleExport() {
    setExporting(true);
    try {
      const params = new URLSearchParams(searchParams.toString());
      params.set("export", "csv");
      const res = await fetch(`/api/export?${params.toString()}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const today = new Date().toISOString().split("T")[0];
      a.download = `grievance_report_${today}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  function isSLABreached(complaint: Complaint) {
    if (complaint.status === "RESOLVED" || complaint.status === "CLOSED") return false;
    return Date.now() > new Date(complaint.slaDueDate).getTime();
  }

  return (
    <div className="space-y-4">
      {/* Responsive Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 w-full sm:w-auto sm:min-w-[220px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ticket, name, roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <Button type="submit" size="sm" variant="outline" className="px-3">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <Select
            options={[{ value: "", label: "All Statuses" }, ...STATUSES]}
            value={searchParams.get("status") || ""}
            onChange={(e) => handleFilter("status", e.target.value)}
            className="w-full sm:w-36 py-2 text-xs sm:text-sm"
          />

          <Select
            options={[{ value: "", label: "All Categories" }, ...CATEGORIES]}
            value={searchParams.get("category") || ""}
            onChange={(e) => handleFilter("category", e.target.value)}
            className="w-full sm:w-44 py-2 text-xs sm:text-sm"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          loading={exporting}
          className="w-full sm:w-auto justify-center"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* ─── Mobile Card List (sm:hidden) ─── */}
      <div className="sm:hidden space-y-3">
        {complaints.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No complaints found matching your filters.</p>
          </div>
        ) : (
          complaints.map((c) => {
            const breached = isSLABreached(c);
            const categoryLabel = CATEGORIES.find((cat) => cat.value === c.category)?.label || c.category;

            return (
              <div
                key={c.id}
                className={cn(
                  "bg-white rounded-xl border border-gray-200 p-4 shadow-xs space-y-3 transition-colors",
                  breached && "border-rose-300 bg-rose-50/50"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-brand-700">
                      {c.ticketId}
                    </span>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{formatDate(c.createdAt)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge status={c.status} />
                    {breached && (
                      <Badge status="SLA_BREACH" pulse className="text-[10px] py-0.5 px-1.5" />
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{c.studentName}</p>
                  <p className="text-xs text-gray-500">{c.studentRoll}</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <Tag className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{categoryLabel}</span>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <SLABadge slaDueDate={c.slaDueDate} status={c.status} />
                  <Link href={`/admin/complaints/${c.id}`} className="flex-1 max-w-[120px]">
                    <Button size="sm" variant="outline" className="w-full justify-center text-xs py-1.5 h-8">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Desktop Table (hidden sm:block) ─── */}
      <div className="hidden sm:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Ticket ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Filed</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">
                  SLA
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400">
                    <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No complaints found matching your filters.</p>
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const breached = isSLABreached(c);
                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        "hover:bg-gray-50 transition-colors",
                        breached && "bg-rose-50 hover:bg-rose-100"
                      )}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-brand-700">
                          {c.ticketId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 truncate max-w-[160px]">
                          {c.studentName}
                        </p>
                        <p className="text-xs text-gray-500">{c.studentRoll}</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs text-gray-600">
                          {CATEGORIES.find((cat) => cat.value === c.category)?.label || c.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <Badge status={c.status} />
                          {breached && (
                            <Badge status="SLA_BREACH" pulse className="text-[10px] py-0.5 px-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <SLABadge slaDueDate={c.slaDueDate} status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link href={`/admin/complaints/${c.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-gray-500 py-2">
          <p className="text-center sm:text-left">
            Showing page <span className="font-medium text-gray-900">{page}</span> of{" "}
            <span className="font-medium text-gray-900">{totalPages}</span> ({total} total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => router.push(`${pathname}?${buildQuery({ page: String(page - 1) })}`)}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => router.push(`${pathname}?${buildQuery({ page: String(page + 1) })}`)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
