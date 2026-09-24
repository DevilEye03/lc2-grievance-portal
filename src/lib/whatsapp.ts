import path from "path";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";

const GRAPH_API_VERSION = "v20.0";

export interface WhatsAppButton {
  id: string;
  title: string;
}

export interface WhatsAppListRow {
  id: string;
  title: string;
  description?: string;
}

export interface WhatsAppListSection {
  title: string;
  rows: WhatsAppListRow[];
}

/**
 * Normalizes phone numbers to standard E.164 digits without '+' or spaces.
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

/**
 * Sends a standard text message via Meta WhatsApp Cloud API.
 * Uses console fallback if WHATSAPP_ACCESS_TOKEN is not configured.
 */
export async function sendWhatsAppText(to: string, message: string): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const cleanTo = normalizePhoneNumber(to);

  if (!token || !phoneId) {
    console.log("\n📱 [WHATSAPP — Console / Local Simulation]");
    console.log(`   To     : +${cleanTo}`);
    console.log(`   Message:`);
    console.log(message);
    console.log("─".repeat(60) + "\n");
    return true;
  }

  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "text",
        text: { preview_url: false, body: message },
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("WhatsApp API Error:", errData);
      return false;
    }

    return true;
  } catch (error) {
    console.error("WhatsApp Send Error:", error);
    return false;
  }
}

/**
 * Sends interactive quick-reply buttons (up to 3 buttons supported by WhatsApp).
 */
export async function sendWhatsAppButtons(
  to: string,
  bodyText: string,
  buttons: WhatsAppButton[]
): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const cleanTo = normalizePhoneNumber(to);

  if (!token || !phoneId) {
    console.log("\n📱 [WHATSAPP BUTTONS — Simulation]");
    console.log(`   To     : +${cleanTo}`);
    console.log(`   Body   : ${bodyText}`);
    console.log(`   Buttons: ${buttons.map((b) => `[${b.title}]`).join("  ")}`);
    console.log("─".repeat(60) + "\n");
    return true;
  }

  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: bodyText },
          action: {
            buttons: buttons.slice(0, 3).map((btn) => ({
              type: "reply",
              reply: {
                id: btn.id,
                title: btn.title.slice(0, 20),
              },
            })),
          },
        },
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("WhatsApp Interactive Button Error:", err);
      // Fallback to text message
      const textFallback = `${bodyText}\n\nReply with:\n` + buttons.map((b) => `• *${b.title}*`).join("\n");
      return sendWhatsAppText(cleanTo, textFallback);
    }

    return true;
  } catch (error) {
    console.error("WhatsApp Buttons Send Error:", error);
    return false;
  }
}

/**
 * Sends an interactive list menu (great for picking categories).
 */
export async function sendWhatsAppList(
  to: string,
  bodyText: string,
  buttonText: string,
  sections: WhatsAppListSection[]
): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const cleanTo = normalizePhoneNumber(to);

  if (!token || !phoneId) {
    console.log("\n📱 [WHATSAPP LIST — Simulation]");
    console.log(`   To     : +${cleanTo}`);
    console.log(`   Body   : ${bodyText}`);
    console.log(`   List   : ${sections.map((s) => s.rows.map((r) => r.title).join(", ")).join(" | ")}`);
    console.log("─".repeat(60) + "\n");
    return true;
  }

  try {
    const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneId}/messages`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: bodyText },
          action: {
            button: buttonText.slice(0, 20),
            sections,
          },
        },
      }),
    });

    if (!res.ok) {
      // Fallback to numbered text menu
      let textFallback = `${bodyText}\n\n`;
      let count = 1;
      for (const s of sections) {
        textFallback += `*${s.title}*\n`;
        for (const r of s.rows) {
          textFallback += `${count++}. ${r.title}\n`;
        }
      }
      return sendWhatsAppText(cleanTo, textFallback);
    }

    return true;
  } catch (error) {
    console.error("WhatsApp List Send Error:", error);
    return false;
  }
}

/**
 * Downloads media sent by a student on WhatsApp Cloud API and saves to /public/uploads/
 */
export async function downloadWhatsAppMedia(mediaId: string): Promise<string | null> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) return null;

  try {
    // 1. Fetch media URL
    const metaRes = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!metaRes.ok) return null;

    const metaData = await metaRes.json();
    const mediaUrl = metaData.url;
    const mimeType = metaData.mime_type || "application/octet-stream";

    let ext = "bin";
    if (mimeType.includes("jpeg") || mimeType.includes("jpg")) ext = "jpg";
    else if (mimeType.includes("png")) ext = "png";
    else if (mimeType.includes("pdf")) ext = "pdf";

    // 2. Download media bytes
    const binaryRes = await fetch(mediaUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!binaryRes.ok) return null;

    const buffer = Buffer.from(await binaryRes.arrayBuffer());
    const filename = `wa_${crypto.randomUUID()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    await writeFile(path.join(uploadDir, filename), buffer);
    return `/uploads/${filename}`;
  } catch (error) {
    console.error("Error downloading WhatsApp media:", error);
    return null;
  }
}

/**
 * Sends an automated status update notification to the student's WhatsApp number.
 */
export async function notifyStudentStatusUpdate(
  phone: string,
  ticketId: string,
  newStatus: string,
  comment: string | null,
  appUrl: string
) {
  if (!phone) return;
  const statusLabel = newStatus.replace("_", " ");
  const trackUrl = `${appUrl}/track?ticketId=${ticketId}`;

  const message =
    `📢 *Grievance Status Update*\n\n` +
    `Hello! The status of your grievance *${ticketId}* at *LAW CENTRE II* has been updated to:\n` +
    `👉 *${statusLabel}*\n\n` +
    (comment ? `💬 *Comment:* ${comment}\n\n` : "") +
    `🔗 *View Live Status:* ${trackUrl}\n\n` +
    `_LAW CENTRE II Grievance Redressal System_`;

  await sendWhatsAppText(phone, message);
}

/**
 * Sends an automated resolution notification to the student's WhatsApp number.
 */
export async function notifyStudentResolution(
  phone: string,
  ticketId: string,
  resolutionText: string,
  appUrl: string
) {
  if (!phone) return;
  const trackUrl = `${appUrl}/track?ticketId=${ticketId}`;

  const message =
    `✅ *Official Resolution Posted*\n\n` +
    `Dear Student, an official resolution has been issued for your grievance *${ticketId}* by the college administration:\n\n` +
    `📜 *Resolution:*\n"${resolutionText}"\n\n` +
    `🔗 *Full Report & Records:* ${trackUrl}\n\n` +
    `_LAW CENTRE II Grievance Redressal System_`;

  await sendWhatsAppText(phone, message);
}
