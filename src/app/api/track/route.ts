import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/track?ticketId=GRV-2026-0001&email=student@edu.com — Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId")?.trim().toUpperCase();
    const identifier = searchParams.get("email")?.trim();

    if (!ticketId || !identifier) {
      return NextResponse.json(
        { success: false, error: "Both Ticket ID and Registered Email or Secret Key are required." },
        { status: 400 }
      );
    }

    // Validate format
    if (!/^GRV-\d{4}-\d{4}$/.test(ticketId)) {
      return NextResponse.json(
        { success: false, error: "Invalid ticket ID format." },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findFirst({
      where: {
        ticketId,
        OR: [
          { studentEmail: identifier.toLowerCase() },
          { trackingSecret: identifier.toUpperCase() },
        ],
      },
      include: {
        statusLogs: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!complaint) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No grievance found with this Ticket ID and Email / Secret Key combination. Please check your details.",
        },
        { status: 404 }
      );
    }

    // Mask sensitive fields
    const safe = {
      ...complaint,
      studentName: complaint.isAnonymous ? "Anonymous Student" : complaint.studentName,
      studentRoll: complaint.isAnonymous ? "PROTECTED" : complaint.studentRoll,
      studentEmail: complaint.isAnonymous ? "[Concealed for Privacy]" : complaint.studentEmail,
      studentPhone: complaint.isAnonymous ? null : complaint.studentPhone ? "***" : null,
      trackingSecret: null, // do not reflect secret
    };

    return NextResponse.json({ success: true, data: safe });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
