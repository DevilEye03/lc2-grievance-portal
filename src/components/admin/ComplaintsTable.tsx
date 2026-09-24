"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Badge, SLABadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { CATEGORIES, STATUSES } from "@/lib/validations";
import { formatDate } from "@/lib/sla";
import type { Complaint } from "@/types";
import { Search, Download, Eye, ChevronLeft, ChevronRight, Filter } from "lucide-react";
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
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search ticket ID, name, roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <Button type="submit" size="sm" variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <Select
          options={[{ value: "", label: "All Statuses" }, ...STATUSES]}
          value={searchParams.get("status") || ""}
          onChange={(e) => handleFilter("status", e.target.value)}
          className="w-40 py-2 text-sm"
        />

        <Select
          options={[{ value: "", label: "All Categories" }, ...CATEGORIES]}
          value={searchParams.get("category") || ""}
          onChange={(e) => handleFilter("category", e.target.value)}
          className="w-48 py-2 text-sm"
        />

        <Button variant="outline" size="sm" onClick={handleExport} loading={exporting}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Ticket ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">
                  Filed
                </th>
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
                      <td className="px-4 py-3 hidden sm:table-cell text-xs text-gray-500">
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing {complaints.length} of {total} complaints
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`${pathname}?${buildQuery({ page: String(page - 1) })}`}
              className={cn(
                "p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-white transition-colors",
                page <= 1 && "opacity-40 pointer-events-none"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="text-sm text-gray-700 font-medium">
              {page} / {totalPages}
            </span>
            <Link
              href={`${pathname}?${buildQuery({ page: String(page + 1) })}`}
              className={cn(
                "p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:bg-white transition-colors",
                page >= totalPages && "opacity-40 pointer-events-none"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
