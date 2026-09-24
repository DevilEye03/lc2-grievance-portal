import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendStatusUpdate } from "@/lib/mailer";
import { notifyStudentStatusUpdate } from "@/lib/whatsapp";

// GET /api/complaints/[id] — Admin: Single complaint with logs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { statusLogs: { orderBy: { createdAt: "asc" } } },
    });

    if (!complaint) {
      return NextResponse.json({ success: false, error: "Complaint not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: complaint });
  } catch (error) {
    console.error("Get complaint error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/complaints/[id] — Admin: Update status and/or assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, assignedTo, comment } = body;

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Complaint not found" }, { status: 404 });
    }

    // Guard: cannot mark RESOLVED/CLOSED without an authority reply
    if (
      (status === "RESOLVED" || status === "CLOSED") &&
      !existing.authorityReply
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot mark as RESOLVED or CLOSED without posting an official authority reply first.",
        },
        { status: 422 }
      );
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo || null;

    const updated = await prisma.complaint.update({
      where: { id },
      data: updateData,
    });

    // Log the status change
    if (status && status !== existing.status) {
      await prisma.statusLog.create({
        data: {
          complaintId: id,
          status,
          comment: comment || null,
          changedBy: session.name,
        },
      });

      // Send email notification (non-blocking)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      sendStatusUpdate(
        existing.studentEmail,
        existing.studentName,
        existing.ticketId,
        status,
        comment || null,
        appUrl
      ).catch(console.error);

      if (existing.studentPhone) {
        notifyStudentStatusUpdate(
          existing.studentPhone,
          existing.ticketId,
          status,
          comment || null,
          appUrl
        ).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Update complaint error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
