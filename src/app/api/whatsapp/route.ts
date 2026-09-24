import { NextRequest, NextResponse } from "next/server";
import { processIncomingWhatsAppMessage } from "@/lib/whatsappBot";
import { downloadWhatsAppMedia } from "@/lib/whatsapp";

/**
 * GET /api/whatsapp — Meta Webhook Verification Endpoint
 * Meta calls this with hub.mode, hub.verify_token, and hub.challenge when setting up the webhook.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken =
    process.env.WHATSAPP_VERIFY_TOKEN || "lc2_grievance_bot_verify_token_2026";

  if (mode === "subscribe" && token === verifyToken) {
    console.log("✅ [WHATSAPP WEBHOOK] Verified successfully with Meta!");
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn("❌ [WHATSAPP WEBHOOK] Verification token mismatch.");
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * POST /api/whatsapp — Incoming Message Receiver
 * Meta posts all incoming student messages, button clicks, and media here.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Meta Webhook payload check
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value || !value.messages || value.messages.length === 0) {
      // Status update event (sent, delivered, read) — acknowledge and ignore
      return NextResponse.json({ status: "acknowledged" }, { status: 200 });
    }

    const message = value.messages[0];
    const fromPhone = message.from;
    const msgType = message.type;

    let textContent = "";
    let interactiveReplyId = "";
    let mediaUrl: string | null = null;

    if (msgType === "text") {
      textContent = message.text?.body || "";
    } else if (msgType === "interactive") {
      const interactive = message.interactive;
      if (interactive.type === "button_reply") {
        interactiveReplyId = interactive.button_reply?.id || "";
        textContent = interactive.button_reply?.title || "";
      } else if (interactive.type === "list_reply") {
        interactiveReplyId = interactive.list_reply?.id || "";
        textContent = interactive.list_reply?.title || "";
      }
    } else if (msgType === "image" || msgType === "document") {
      const mediaId = message.image?.id || message.document?.id;
      if (mediaId) {
        mediaUrl = await downloadWhatsAppMedia(mediaId);
      }
      textContent = message.image?.caption || message.document?.caption || "attachment";
    }

    // Process message asynchronously through the state machine
    if (fromPhone) {
      await processIncomingWhatsAppMessage({
        fromPhone,
        text: textContent,
        interactiveReplyId,
        mediaUrl,
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("WhatsApp Webhook Error:", error);
    // Return 200 to Meta so it does not retry failed payloads indefinitely
    return NextResponse.json({ success: false, error: "Internal Error" }, { status: 200 });
  }
}
