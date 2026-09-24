import { NextRequest, NextResponse } from "next/server";
import { processIncomingWhatsAppMessage } from "@/lib/whatsappBot";
import { prisma } from "@/lib/prisma";
import { normalizePhoneNumber } from "@/lib/whatsapp";

/**
 * POST /api/whatsapp/simulate
 * Simulates an incoming student message to the WhatsApp Bot state machine.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone = "919876543210", text = "", interactiveReplyId } = body;
    const cleanPhone = normalizePhoneNumber(phone);

    const botResponse = await processIncomingWhatsAppMessage({
      fromPhone: cleanPhone,
      text,
      interactiveReplyId,
    });

    const session = await prisma.whatsAppSession.findUnique({
      where: { phone: cleanPhone },
    });

    return NextResponse.json({
      success: true,
      reply: botResponse,
      session: {
        step: session?.step || "IDLE",
        tempData: JSON.parse(session?.tempData || "{}"),
      },
    });
  } catch (error) {
    console.error("Simulation Error:", error);
    return NextResponse.json(
      { success: false, error: "Simulation failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/whatsapp/simulate?phone=...
 * Resets the session for testing.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone") || "919876543210";
    const cleanPhone = normalizePhoneNumber(phone);

    await prisma.whatsAppSession.deleteMany({
      where: { phone: cleanPhone },
    });

    return NextResponse.json({ success: true, message: "Session reset" });
  } catch (error) {
    console.error("Reset Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset session" },
      { status: 500 }
    );
  }
}
