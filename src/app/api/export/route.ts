import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CATEGORIES, STATUSES } from "@/lib/validations";
import { getSLAStatus } from "@/lib/sla";

export const dynamic = "force-dynamic";

// GET /api/export?status=...&category=...&q=... — Admin CSV export
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const status = searchParams.get("status") || "";
    const category = searchParams.get("category") || "";

    const where: Record<string, unknown> = {};
    if (q) {
      where.OR = [
        { ticketId: { contains: q } },
        { studentName: { contains: q } },
        { studentRoll: { contains: q } },
      ];
    }
    if (status) where.status = status;
    if (category) where.category = category;

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    const headers = [
      "Ticket ID",
      "Student Name",
      "Roll No",
      "Email",
      "Phone",
      "Category",
      "Subject",
      "Status",
      "SLA Status",
      "Assigned To",
      "Date Filed",
      "ACK Due Date",
      "SLA Due Date",
      "Replied At",
    ];

    const rows = complaints.map((c) => {
      const sla = getSLAStatus(new Date(c.slaDueDate), c.status);
      const catLabel = CATEGORIES.find((cat) => cat.value === c.category)?.label || c.category;
      const stsLabel = STATUSES.find((s) => s.value === c.status)?.label || c.status;

      const slaLabel = sla === "breached" ? "SLA Breached" : sla === "warning" ? "Warning" : "OK";

      function esc(v: string | null | undefined): string {
        if (!v) return "";
        return `"${v.replace(/"/g, '""')}"`;
      }

      return [
        esc(c.ticketId),
        esc(c.studentName),
        esc(c.studentRoll),
        esc(c.studentEmail),
        esc(c.studentPhone),
        esc(catLabel),
        esc(c.subject),
        esc(stsLabel),
        esc(slaLabel),
        esc(c.assignedTo),
        esc(new Date(c.createdAt).toLocaleDateString("en-IN")),
        esc(new Date(c.ackDueDate).toLocaleString("en-IN")),
        esc(new Date(c.slaDueDate).toLocaleDateString("en-IN")),
        esc(c.repliedAt ? new Date(c.repliedAt).toLocaleString("en-IN") : ""),
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="grievance_report_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ success: false, error: "Export failed." }, { status: 500 });
  }
}
