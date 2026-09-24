import { prisma } from "@/lib/prisma";
import { generateTicketId } from "@/lib/ticketId";
import { computeSLADates, formatDate, formatDateTime } from "@/lib/sla";
import { sendComplaintRegistered } from "@/lib/mailer";
import {
  sendWhatsAppText,
  sendWhatsAppButtons,
  normalizePhoneNumber,
} from "./whatsapp";

// Category definitions matching the web portal
export const WA_CATEGORIES = [
  { id: "ACADEMIC", number: "1", title: "Academic & Curriculum" },
  { id: "HOSTEL_MESS", number: "2", title: "Hostel & Mess" },
  { id: "EXAMINATION", number: "3", title: "Examination & Marks" },
  { id: "INFRASTRUCTURE_MAINTENANCE", number: "4", title: "Infrastructure & Maintenance" },
  { id: "FEES_SCHOLARSHIP", number: "5", title: "Fees & Scholarships" },
  { id: "ANTI_RAGGING", number: "6", title: "Anti-Ragging Cell" },
  { id: "DISCIPLINARY", number: "7", title: "Disciplinary Matters" },
  { id: "OTHER", number: "8", title: "Other Inquiries" },
] as const;

interface TempFormData {
  studentName?: string;
  studentRoll?: string;
  studentEmail?: string;
  category?: string;
  subject?: string;
  description?: string;
  attachmentUrl?: string | null;
}

/**
 * Handles incoming WhatsApp messages and advances the conversational state machine.
 */
export async function processIncomingWhatsAppMessage({
  fromPhone,
  text,
  interactiveReplyId,
  mediaUrl,
}: {
  fromPhone: string;
  text?: string;
  interactiveReplyId?: string;
  mediaUrl?: string | null;
}): Promise<string> {
  const cleanPhone = normalizePhoneNumber(fromPhone);
  const input = (interactiveReplyId || text || "").trim();
  const lower = input.toLowerCase();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 1. Get or create session
  let session = await prisma.whatsAppSession.findUnique({
    where: { phone: cleanPhone },
  });

  if (!session) {
    session = await prisma.whatsAppSession.create({
      data: {
        phone: cleanPhone,
        step: "IDLE",
        tempData: "{}",
      },
    });
  }

  let formData: TempFormData = {};
  try {
    formData = JSON.parse(session.tempData || "{}");
  } catch {
    formData = {};
  }

  // ─── Global Interceptors ──────────────────────────────────────────────────
  if (
    lower === "menu" ||
    lower === "hi" ||
    lower === "hello" ||
    lower === "start" ||
    lower === "restart" ||
    lower === "help"
  ) {
    await prisma.whatsAppSession.update({
      where: { id: session.id },
      data: { step: "IDLE", tempData: "{}", lastActive: new Date() },
    });
    return sendMainMenu(cleanPhone);
  }

  if (lower === "cancel" && session.step !== "IDLE") {
    await prisma.whatsAppSession.update({
      where: { id: session.id },
      data: { step: "IDLE", tempData: "{}", lastActive: new Date() },
    });
    await sendWhatsAppText(
      cleanPhone,
      "❌ Current action cancelled. Returning to main menu."
    );
    return sendMainMenu(cleanPhone);
  }

  // ─── State Machine ────────────────────────────────────────────────────────
  switch (session.step) {
    case "IDLE": {
      if (input === "btn_submit" || lower === "1" || lower.includes("submit")) {
        await prisma.whatsAppSession.update({
          where: { id: session.id },
          data: { step: "SUBMIT_NAME", tempData: "{}", lastActive: new Date() },
        });

        const prompt =
          `📝 *File a Grievance — LAW CENTRE II*\n\n` +
          `Please reply with your *Full Name* (as registered with the college):\n\n` +
          `_(Type *cancel* at any time to return to main menu)_`;
        await sendWhatsAppText(cleanPhone, prompt);
        return prompt;
      }

      if (input === "btn_track" || lower === "2" || lower.includes("track")) {
        await prisma.whatsAppSession.update({
          where: { id: session.id },
          data: { step: "TRACK_INPUT", lastActive: new Date() },
        });

        const prompt =
          `🔍 *Track Grievance Status*\n\n` +
          `Please reply with your *Ticket ID* (format: \`GRV-YYYY-XXXX\`, e.g., \`GRV-2026-0001\`):`;
        await sendWhatsAppText(cleanPhone, prompt);
        return prompt;
      }

      if (input === "btn_faq" || lower === "3" || lower.includes("faq")) {
        return sendFAQ(cleanPhone);
      }

      if (input === "btn_contact" || lower === "4" || lower.includes("contact")) {
        const contactMsg =
          `📞 *LAW CENTRE II Administration & Helpdesk*\n\n` +
          `🏛️ *Institution:* Law Centre II, Faculty of Law, University of Delhi\n` +
          `📍 *Campus:* Chhatra Marg, University Enclave, Delhi 110007\n` +
          `📧 *Proctor / Helpdesk Email:* helpdesk@lc2.du.ac.in\n` +
          `🌐 *Portal:* ${appUrl}\n\n` +
          `⏱️ *Office Hours:* Monday - Friday, 9:00 AM - 5:00 PM`;
        await sendWhatsAppText(cleanPhone, contactMsg);
        return sendMainMenu(cleanPhone);
      }

      // Default fallback
      return sendMainMenu(cleanPhone);
    }

    // ─── Step 1: Full Name ──────────────────────────────────────────────────
    case "SUBMIT_NAME": {
      if (input.length < 2) {
        const err = `⚠️ Please enter a valid name (at least 2 characters):`;
        await sendWhatsAppText(cleanPhone, err);
        return err;
      }

      formData.studentName = input;
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: {
          step: "SUBMIT_ROLL",
          tempData: JSON.stringify(formData),
          lastActive: new Date(),
        },
      });

      const next =
        `Thank you, *${input}*.\n\n` +
        `Now please enter your *Student Roll / Registration Number* (e.g. \`21LC2001\` or \`ME2022045\`):`;
      await sendWhatsAppText(cleanPhone, next);
      return next;
    }

    // ─── Step 2: Roll Number ────────────────────────────────────────────────
    case "SUBMIT_ROLL": {
      if (input.length < 3) {
        const err = `⚠️ Please enter a valid roll number (at least 3 characters):`;
        await sendWhatsAppText(cleanPhone, err);
        return err;
      }

      formData.studentRoll = input.toUpperCase();
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: {
          step: "SUBMIT_EMAIL",
          tempData: JSON.stringify(formData),
          lastActive: new Date(),
        },
      });

      const next =
        `Roll Number recorded: *${formData.studentRoll}*.\n\n` +
        `Please enter your *Email Address* (confirmation and status updates will be sent here):`;
      await sendWhatsAppText(cleanPhone, next);
      return next;
    }

    // ─── Step 3: Student Email ──────────────────────────────────────────────
    case "SUBMIT_EMAIL": {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        const err = `⚠️ Please enter a valid email format (e.g. \`student@law.du.ac.in\`):`;
        await sendWhatsAppText(cleanPhone, err);
        return err;
      }

      formData.studentEmail = input.toLowerCase();
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: {
          step: "SUBMIT_CATEGORY",
          tempData: JSON.stringify(formData),
          lastActive: new Date(),
        },
      });

      let catMenu = `Please select the *Category* of your grievance:\n\n`;
      for (const c of WA_CATEGORIES) {
        catMenu += `*${c.number}.* ${c.title}\n`;
      }
      catMenu += `\nReply with the category number (*1 - 8*):`;

      await sendWhatsAppText(cleanPhone, catMenu);
      return catMenu;
    }

    // ─── Step 4: Category ───────────────────────────────────────────────────
    case "SUBMIT_CATEGORY": {
      const matchedCat = WA_CATEGORIES.find(
        (c) =>
          c.number === input ||
          c.id.toLowerCase() === lower ||
          c.title.toLowerCase().includes(lower)
      );

      if (!matchedCat) {
        const err =
          `⚠️ Invalid choice. Please reply with a number from *1 to 8* matching your category:\n` +
          `1. Academic  2. Hostel/Mess  3. Exam  4. Infrastructure\n` +
          `5. Fees/Scholarship  6. Anti-Ragging  7. Disciplinary  8. Other`;
        await sendWhatsAppText(cleanPhone, err);
        return err;
      }

      formData.category = matchedCat.id;
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: {
          step: "SUBMIT_SUBJECT",
          tempData: JSON.stringify(formData),
          lastActive: new Date(),
        },
      });

      const next =
        `Category: *${matchedCat.title}* ✅\n\n` +
        `Please enter a brief *Subject Line* for your grievance (maximum 120 characters, e.g. 'Attendance shortage calculation in Criminal Law'):`;
      await sendWhatsAppText(cleanPhone, next);
      return next;
    }

    // ─── Step 5: Subject Line ───────────────────────────────────────────────
    case "SUBMIT_SUBJECT": {
      if (input.length < 5 || input.length > 120) {
        const err = `⚠️ Subject line must be between 5 and 120 characters. Please re-enter:`;
        await sendWhatsAppText(cleanPhone, err);
        return err;
      }

      formData.subject = input;
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: {
          step: "SUBMIT_DESCRIPTION",
          tempData: JSON.stringify(formData),
          lastActive: new Date(),
        },
      });

      const next =
        `Subject saved.\n\n` +
        `Now please enter the *Detailed Description* of your grievance (minimum 30 characters explaining what happened, dates, or relevant details):`;
      await sendWhatsAppText(cleanPhone, next);
      return next;
    }

    // ─── Step 6: Detailed Description ───────────────────────────────────────
    case "SUBMIT_DESCRIPTION": {
      if (input.length < 30) {
        const remaining = 30 - input.length;
        const err = `⚠️ Description is too short. Please provide at least 30 characters (${remaining} more needed):`;
        await sendWhatsAppText(cleanPhone, err);
        return err;
      }

      formData.description = input;
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: {
          step: "SUBMIT_ATTACHMENT",
          tempData: JSON.stringify(formData),
          lastActive: new Date(),
        },
      });

      const next =
        `Description recorded! 📄\n\n` +
        `*Do you have any supporting document or photo?* 📎\n\n` +
        `• Send an image / PDF document right now, or\n` +
        `• Reply with *skip* to submit immediately without attachment.`;
      await sendWhatsAppText(cleanPhone, next);
      return next;
    }

    // ─── Step 7: Attachment & Final Creation ────────────────────────────────
    case "SUBMIT_ATTACHMENT": {
      const hasMedia = !!mediaUrl;
      const skip = lower === "skip" || lower === "no" || lower === "none";

      if (hasMedia) {
        formData.attachmentUrl = mediaUrl;
      } else if (!skip) {
        // If they sent text that isn't skip, ask them to send media or type skip
        const prompt = `📎 Please send a photo/document or reply *skip* to finish:`;
        await sendWhatsAppText(cleanPhone, prompt);
        return prompt;
      }

      // Generate Ticket ID and compute SLA dates
      const ticketId = await generateTicketId();
      const now = new Date();
      const { ackDueDate, slaDueDate } = computeSLADates(now);

      const complaint = await prisma.complaint.create({
        data: {
          ticketId,
          studentName: formData.studentName || "Student",
          studentRoll: formData.studentRoll || "N/A",
          studentEmail: formData.studentEmail || "student@lc2.du.ac.in",
          studentPhone: cleanPhone,
          category: formData.category || "OTHER",
          subject: formData.subject || "Grievance submitted via WhatsApp",
          description: formData.description || "N/A",
          attachmentUrl: formData.attachmentUrl || null,
          status: "REGISTERED",
          source: "WHATSAPP",
          ackDueDate,
          slaDueDate,
          statusLogs: {
            create: {
              status: "REGISTERED",
              comment: "Grievance registered via WhatsApp Bot.",
              changedBy: "WhatsApp System",
            },
          },
        },
      });

      // Send email confirmation
      sendComplaintRegistered(
        complaint.studentEmail,
        complaint.studentName,
        complaint.ticketId,
        complaint.subject,
        appUrl
      ).catch(console.error);

      // Reset session to IDLE
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: { step: "IDLE", tempData: "{}", lastActive: new Date() },
      });

      const catTitle =
        WA_CATEGORIES.find((c) => c.id === complaint.category)?.title ||
        complaint.category;

      const successMsg =
        `🎉 *Grievance Successfully Registered!*\n\n` +
        `🎫 *Ticket ID:* \`${complaint.ticketId}\`\n` +
        `📋 *Subject:* ${complaint.subject}\n` +
        `📂 *Category:* ${catTitle}\n` +
        `⏱️ *Acknowledgment SLA:* within 48 hours (${formatDateTime(ackDueDate)})\n` +
        `🎯 *Target Resolution Date:* ${formatDate(slaDueDate)}\n\n` +
        `🔔 *Automatic Alerts:* You will receive live WhatsApp updates as soon as the administration reviews or resolves your complaint.\n\n` +
        `🔗 *Web Portal Tracker:* ${appUrl}/track?ticketId=${complaint.ticketId}&email=${encodeURIComponent(complaint.studentEmail)}\n\n` +
        `_Reply *menu* at any time to return to the main menu._`;

      await sendWhatsAppText(cleanPhone, successMsg);
      return successMsg;
    }

    // ─── Tracking Flow ──────────────────────────────────────────────────────
    case "TRACK_INPUT": {
      const cleanTicket = input.toUpperCase().replace(/\s+/g, "");

      const complaint = await prisma.complaint.findUnique({
        where: { ticketId: cleanTicket },
        include: { statusLogs: { orderBy: { createdAt: "desc" } } },
      });

      // Reset to IDLE after lookup
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: { step: "IDLE", lastActive: new Date() },
      });

      if (!complaint) {
        const notFoundMsg =
          `❌ *Ticket Not Found*\n\n` +
          `No grievance found with Ticket ID: *${input}*.\n\n` +
          `Please check that the ID is formatted as \`GRV-YYYY-XXXX\` (e.g. \`GRV-2026-0001\`).\n\n` +
          `_Reply *2* to try again, or *menu* for main menu._`;
        await sendWhatsAppText(cleanPhone, notFoundMsg);
        return notFoundMsg;
      }

      const statusLabels: Record<string, string> = {
        REGISTERED: "⚪ Registered",
        ACKNOWLEDGED: "🔵 Acknowledged",
        IN_PROGRESS: "🟡 In Progress",
        RESOLVED: "🟢 Resolved",
        CLOSED: "⚫ Closed",
      };

      const catTitle =
        WA_CATEGORIES.find((c) => c.id === complaint.category)?.title ||
        complaint.category;

      let report =
        `🔍 *Grievance Status — LAW CENTRE II*\n\n` +
        `🎫 *Ticket ID:* \`${complaint.ticketId}\`\n` +
        `👤 *Student:* ${complaint.studentName} (${complaint.studentRoll})\n` +
        `📂 *Category:* ${catTitle}\n` +
        `📋 *Subject:* ${complaint.subject}\n` +
        `📌 *Current Status:* *${statusLabels[complaint.status] || complaint.status}*\n` +
        `📅 *Date Filed:* ${formatDate(complaint.createdAt)}\n` +
        `🎯 *Target Resolution Date:* ${formatDate(complaint.slaDueDate)}\n`;

      if (complaint.assignedTo) {
        report += `👮 *Assigned To:* ${complaint.assignedTo}\n`;
      }

      if (complaint.authorityReply) {
        report +=
          `\n✅ *Official Resolution Response:*\n` +
          `"${complaint.authorityReply}"\n` +
          `_(Issued: ${formatDateTime(complaint.repliedAt || complaint.updatedAt)})_\n`;
      } else {
        report +=
          `\n⏳ *Resolution Pending:* The designated authority is actively processing this grievance under college SLA guidelines.\n`;
      }

      report +=
        `\n🔗 *Full Timeline Online:* ${appUrl}/track?ticketId=${complaint.ticketId}&email=${encodeURIComponent(complaint.studentEmail)}\n\n` +
        `_Reply *menu* to return to main menu._`;

      await sendWhatsAppText(cleanPhone, report);
      return report;
    }

    default: {
      await prisma.whatsAppSession.update({
        where: { id: session.id },
        data: { step: "IDLE", lastActive: new Date() },
      });
      return sendMainMenu(cleanPhone);
    }
  }
}

/**
 * Sends the Main Welcome Menu to the student.
 */
async function sendMainMenu(phone: string): Promise<string> {
  const bodyText =
    `🏛️ *LAW CENTRE II — Grievance Redressal Bot*\n\n` +
    `Welcome! You can submit grievances, track existing tickets, and get official administrative responses directly on WhatsApp.\n\n` +
    `Please select an option:\n` +
    `*1.* 📝 Submit Grievance\n` +
    `*2.* 🔍 Track Status\n` +
    `*3.* 📚 FAQs & Categories\n` +
    `*4.* 📞 Contact Administration\n\n` +
    `_Reply with a number (1-4) or tap a button below:_`;

  await sendWhatsAppButtons(phone, bodyText, [
    { id: "btn_submit", title: "📝 Submit Grievance" },
    { id: "btn_track", title: "🔍 Track Status" },
    { id: "btn_faq", title: "📚 FAQs & Help" },
  ]);

  return bodyText;
}

/**
 * Sends FAQ & Guidance to the student.
 */
async function sendFAQ(phone: string): Promise<string> {
  const faqText =
    `📚 *Frequently Asked Questions & Guidelines*\n\n` +
    `*Q1: How does the grievance process work?*\n` +
    `When you submit a complaint via WhatsApp or our web portal, it is assigned a sequential Ticket ID (e.g., \`GRV-2026-0001\`). It enters our monitored administration queue.\n\n` +
    `*Q2: What are the SLA resolution timeframes?*\n` +
    `• *Acknowledgment SLA:* Within 48 hours.\n` +
    `• *Resolution SLA:* Within 7 calendar days.\n\n` +
    `*Q3: Will I be notified when action is taken?*\n` +
    `Yes! The system automatically dispatches WhatsApp messages and emails whenever the authority acknowledges, comments, or posts an official resolution.\n\n` +
    `*Q4: What categories can I report under?*\n` +
    `Academic, Hostel/Mess, Examination, Infrastructure, Fees/Scholarships, Anti-Ragging, and Disciplinary matters.\n\n` +
    `_Reply *1* to submit a grievance, or *menu* to return._`;

  await sendWhatsAppText(phone, faqText);
  return faqText;
}
