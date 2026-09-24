import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/track?ticketId=GRV-2026-0001&email=student@edu.com — Public
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId")?.trim().toUpperCase();
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!ticketId || !email) {
      return NextResponse.json(
        { success: false, error: "Both ticketId and email are required." },
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
        studentEmail: email,
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
            "No grievance found with this Ticket ID and email combination. Please check your details.",
        },
        { status: 404 }
      );
    }

    // Mask sensitive fields
    const safe = {
      ...complaint,
      studentPhone: complaint.studentPhone ? "***" : null,
    };

    return NextResponse.json({ success: true, data: safe });
  } catch (error) {
    console.error("Track error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
