import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GrievanceForm } from "@/components/portal/GrievanceForm";

export const metadata: Metadata = { title: "Submit Grievance" };

export default function SubmitPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 py-6 sm:py-10 px-3.5 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Submit a Grievance</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              File an official or 100% anonymous complaint. You will receive an instant Ticket ID.
            </p>
          </div>
          <GrievanceForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
