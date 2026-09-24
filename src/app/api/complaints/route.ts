import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { complaintSubmitSchema } from "@/lib/validations";
import { generateTicketId } from "@/lib/ticketId";
import { computeSLADates } from "@/lib/sla";
import { sendComplaintRegistered } from "@/lib/mailer";
import { getSession } from "@/lib/auth";

// POST /api/complaints — Public: Submit a new complaint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = complaintSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const ticketId = await generateTicketId();
    const now = new Date();
    const { ackDueDate, slaDueDate } = computeSLADates(now);

    const complaint = await prisma.complaint.create({
      data: {
        ticketId,
        studentName: data.studentName,
        studentRoll: data.studentRoll,
        studentEmail: data.studentEmail,
        studentPhone: data.studentPhone || null,
        category: data.category,
        subject: data.subject,
        description: data.description,
        attachmentUrl: body.attachmentUrl || null,
        status: "REGISTERED",
        ackDueDate,
        slaDueDate,
        statusLogs: {
          create: {
            status: "REGISTERED",
            comment: "Complaint successfully registered via portal.",
            changedBy: "System",
          },
        },
      },
    });

    // Send confirmation email (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    sendComplaintRegistered(
      complaint.studentEmail,
      complaint.studentName,
      complaint.ticketId,
      complaint.subject,
      appUrl
    ).catch(console.error);

    return NextResponse.json({ success: true, data: { ticketId, id: complaint.id } });
  } catch (error) {
    console.error("Create complaint error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/complaints — Admin: List complaints with filters + pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const pageSize = Math.min(50, Number(searchParams.get("pageSize") || 20));
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

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.complaint.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        complaints,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("List complaints error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
