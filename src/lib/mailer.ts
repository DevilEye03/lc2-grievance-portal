import nodemailer from "nodemailer";

function createTransport() {
  if (!process.env.SMTP_HOST) {
    // Console fallback — prints email to terminal in dev
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail(to: string, subject: string, html: string) {
  const transport = createTransport();
  const from = process.env.SMTP_FROM || "LAW CENTRE II Grievance Portal <noreply@lc2.du.ac.in>";

  if (!transport) {
    console.log("\n📧 [EMAIL — Console Fallback]");
    console.log(`   To     : ${to}`);
    console.log(`   From   : ${from}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Body   : [HTML content — see below]`);
    console.log(html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
    console.log("─".repeat(60) + "\n");
    return;
  }

  await transport.sendMail({ from, to, subject, html });
}

// ─── Email templates ──────────────────────────────────────────────────────────

export async function sendComplaintRegistered(
  studentEmail: string,
  studentName: string,
  ticketId: string,
  subject: string,
  appUrl: string
) {
  const trackUrl = `${appUrl}/track?ticketId=${ticketId}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#4f46e5;padding:24px">
        <h1 style="color:#fff;margin:0;font-size:20px">LAW CENTRE II Grievance Portal</h1>
      </div>
      <div style="padding:24px">
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>Your grievance has been successfully registered. Here are your details:</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:4px 0"><strong>Ticket ID:</strong> <span style="color:#4f46e5;font-size:18px;font-weight:bold">${ticketId}</span></p>
          <p style="margin:4px 0"><strong>Subject:</strong> ${subject}</p>
          <p style="margin:4px 0"><strong>Status:</strong> Registered</p>
        </div>
        <p>Please save your Ticket ID. You can track the status of your grievance at any time using the link below:</p>
        <a href="${trackUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin:8px 0">Track Your Grievance →</a>
        <p style="margin-top:24px;color:#6b7280;font-size:13px">
          You will receive email updates when the status of your grievance changes.<br/>
          The college authority is required to acknowledge your complaint within 48 hours and resolve it within 7 calendar days.
        </p>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;color:#9ca3af;font-size:12px">
        LAW CENTRE II Grievance Portal | This is an automated message, please do not reply.
      </div>
    </div>`;

  await sendMail(studentEmail, `Grievance Registered — Ticket ID: ${ticketId}`, html);
}

export async function sendStatusUpdate(
  studentEmail: string,
  studentName: string,
  ticketId: string,
  newStatus: string,
  comment: string | null,
  appUrl: string
) {
  const trackUrl = `${appUrl}/track?ticketId=${ticketId}`;
  const statusLabel = newStatus.replace("_", " ");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#4f46e5;padding:24px">
        <h1 style="color:#fff;margin:0;font-size:20px">LAW CENTRE II Grievance Portal</h1>
      </div>
      <div style="padding:24px">
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>The status of your grievance <strong>${ticketId}</strong> has been updated.</p>
        <div style="background:#f3f4f6;border-radius:8px;padding:16px;margin:16px 0">
          <p style="margin:4px 0"><strong>New Status:</strong> ${statusLabel}</p>
          ${comment ? `<p style="margin:4px 0"><strong>Comment:</strong> ${comment}</p>` : ""}
        </div>
        <a href="${trackUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin:8px 0">View Full Status →</a>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;color:#9ca3af;font-size:12px">
        LAW CENTRE II Grievance Portal | This is an automated message.
      </div>
    </div>`;

  await sendMail(studentEmail, `Grievance Status Update — ${ticketId}: ${statusLabel}`, html);
}

export async function sendAuthorityReply(
  studentEmail: string,
  studentName: string,
  ticketId: string,
  replyText: string,
  appUrl: string
) {
  const trackUrl = `${appUrl}/track?ticketId=${ticketId}`;
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
      <div style="background:#059669;padding:24px">
        <h1 style="color:#fff;margin:0;font-size:20px">Official Resolution — LAW CENTRE II Grievance Portal</h1>
      </div>
      <div style="padding:24px">
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>The college authority has posted an official resolution for your grievance <strong>${ticketId}</strong>.</p>
        <div style="border-left:4px solid #059669;background:#f0fdf4;padding:16px;margin:16px 0;border-radius:0 8px 8px 0">
          <p style="margin:0;color:#065f46">${replyText}</p>
        </div>
        <a href="${trackUrl}" style="display:inline-block;background:#059669;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;margin:8px 0">View Full Resolution →</a>
      </div>
      <div style="background:#f9fafb;padding:16px;text-align:center;color:#9ca3af;font-size:12px">
        LAW CENTRE II Grievance Portal | This is an automated message.
      </div>
    </div>`;

  await sendMail(studentEmail, `Official Resolution Posted — Ticket ${ticketId}`, html);
}
