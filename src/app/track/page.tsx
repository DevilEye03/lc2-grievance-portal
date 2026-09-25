import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TrackForm } from "@/components/portal/TrackForm";
import { TrackResult } from "@/components/portal/TrackResult";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { Search, AlertCircle } from "lucide-react";
import type { Complaint } from "@/types";

import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Track Grievance" };

async function fetchComplaint(
  ticketId: string,
  email: string
): Promise<{ complaint?: Complaint; error?: string }> {
  try {
    const cleanTicketId = ticketId.trim().toUpperCase();
    const cleanIdentifier = email.trim();

    if (!cleanTicketId || !cleanIdentifier) {
      return { error: "Both Ticket ID and Registered Email or Secret Key are required." };
    }

    if (!/^GRV-\d{4}-\d{4}$/.test(cleanTicketId)) {
      return { error: "Invalid Ticket ID format. Example: GRV-2026-0001" };
    }

    const complaint = await prisma.complaint.findFirst({
      where: {
        ticketId: cleanTicketId,
        OR: [
          { studentEmail: cleanIdentifier.toLowerCase() },
          { trackingSecret: cleanIdentifier.toUpperCase() },
        ],
      },
      include: {
        statusLogs: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!complaint) {
      return {
        error:
          "No grievance found with this Ticket ID and Email / Secret Key combination. Please check your details.",
      };
    }

    // Mask sensitive fields and serialize Date objects to ISO strings
    const safe: Complaint = {
      id: complaint.id,
      ticketId: complaint.ticketId,
      isAnonymous: complaint.isAnonymous,
      studentName: complaint.isAnonymous ? "Anonymous Student" : complaint.studentName,
      studentRoll: complaint.isAnonymous ? "PROTECTED" : complaint.studentRoll,
      studentEmail: complaint.isAnonymous ? "[Concealed for Privacy]" : complaint.studentEmail,
      studentPhone: complaint.isAnonymous ? null : complaint.studentPhone ? "***" : null,
      category: complaint.category,
      subject: complaint.subject,
      description: complaint.description,
      attachmentUrl: complaint.attachmentUrl,
      status: complaint.status,
      assignedTo: complaint.assignedTo,
      authorityReply: complaint.authorityReply,
      repliedAt: complaint.repliedAt ? complaint.repliedAt.toISOString() : null,
      ackDueDate: complaint.ackDueDate.toISOString(),
      slaDueDate: complaint.slaDueDate.toISOString(),
      createdAt: complaint.createdAt.toISOString(),
      updatedAt: complaint.updatedAt.toISOString(),
      statusLogs: complaint.statusLogs.map((log) => ({
        id: log.id,
        complaintId: log.complaintId,
        status: log.status,
        comment: log.comment,
        changedBy: log.changedBy,
        createdAt: log.createdAt.toISOString(),
      })),
    };

    return { complaint: safe };
  } catch (error) {
    console.error("Track error:", error);
    return { error: "Unable to retrieve grievance details. Please try again." };
  }
}

interface TrackResultWrapperProps {
  ticketId: string;
  email: string;
}

async function TrackResultWrapper({ ticketId, email }: TrackResultWrapperProps) {
  const { complaint, error } = await fetchComplaint(ticketId, email);

  if (error) {
    return (
      <Card>
        <div className="flex items-center gap-3 text-rose-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </Card>
    );
  }

  if (!complaint) return null;
  return <TrackResult complaint={complaint} />;
}

interface TrackPageProps {
  searchParams: Promise<{ ticketId?: string; email?: string }>;
}

export default async function TrackPage({ searchParams }: TrackPageProps) {
  const params = await searchParams;
  const ticketId = params.ticketId || "";
  const email = params.email || "";
  const hasSearch = ticketId && email;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-100 text-brand-600 mb-4">
              <Search className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Track Your Grievance</h1>
            <p className="text-gray-500 mt-1">
              Enter your Ticket ID and registered email to check the status.
            </p>
          </div>

          <Card className="mb-6">
            <Suspense>
              <TrackForm initialTicketId={ticketId} />
            </Suspense>
          </Card>

          {hasSearch && (
            <Suspense fallback={<PageSpinner />}>
              <TrackResultWrapper ticketId={ticketId} email={email} />
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}
