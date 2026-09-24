import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { replySchema } from "@/lib/validations";
import { sendAuthorityReply, sendStatusUpdate } from "@/lib/mailer";
import { notifyStudentResolution } from "@/lib/whatsapp";

// POST /api/complaints/[id]/reply — Admin: Post official authority reply
export async function POST(
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

    const parsed = replySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { authorityReply, status } = parsed.data;

    const existing = await prisma.complaint.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Complaint not found" }, { status: 404 });
    }

    const now = new Date();

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        authorityReply,
        repliedAt: now,
        status,
        updatedAt: now,
      },
    });

    // Append status log
    await prisma.statusLog.create({
      data: {
        complaintId: id,
        status,
        comment: "Official authority reply posted.",
        changedBy: session.name,
      },
    });

    // Send emails (non-blocking)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    sendAuthorityReply(
      existing.studentEmail,
      existing.studentName,
      existing.ticketId,
      authorityReply,
      appUrl
    ).catch(console.error);

    sendStatusUpdate(
      existing.studentEmail,
      existing.studentName,
      existing.ticketId,
      status,
      "Official resolution has been posted.",
      appUrl
    ).catch(console.error);

    if (existing.studentPhone) {
      notifyStudentResolution(
        existing.studentPhone,
        existing.ticketId,
        authorityReply,
        appUrl
      ).catch(console.error);
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Reply error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
