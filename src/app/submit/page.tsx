import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { GrievanceForm } from "@/components/portal/GrievanceForm";
import { FileText } from "lucide-react";

export const metadata: Metadata = { title: "Submit Grievance" };

export default function SubmitPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-brand-100 text-brand-600 mb-4">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Submit a Grievance</h1>
            <p className="text-gray-500 mt-1">
              Fill in the form below. You will receive a unique Ticket ID upon submission.
            </p>
          </div>
          <GrievanceForm />
        </div>
      </main>
    </div>
  );
}
