import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { TrackForm } from "@/components/portal/TrackForm";
import { TrackResult } from "@/components/portal/TrackResult";
import { Card } from "@/components/ui/Card";
import { PageSpinner } from "@/components/ui/Spinner";
import { Search, AlertCircle } from "lucide-react";
import type { Complaint } from "@/types";

export const metadata: Metadata = { title: "Track Grievance" };

async function fetchComplaint(
  ticketId: string,
  email: string
): Promise<{ complaint?: Complaint; error?: string }> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(
      `${appUrl}/api/track?ticketId=${encodeURIComponent(ticketId)}&email=${encodeURIComponent(email)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    if (data.success) return { complaint: data.data };
    return { error: data.error };
  } catch {
    return { error: "Unable to connect to server. Please try again." };
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
