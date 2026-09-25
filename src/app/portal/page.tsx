import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { FileText, Search, Clock, ShieldCheck, ArrowRight, Lock } from "lucide-react";

export const metadata: Metadata = { title: "Home" };
export const revalidate = 3600;

export default function PortalLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Minimal Hero Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 text-brand-700 rounded-full px-3.5 py-1 text-xs font-semibold mb-3">
            <span>Faculty of Law • University of Delhi</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            LAW CENTRE II <span className="text-brand-600">Grievance Portal</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            A transparent and time-bound platform for student grievance redressal. Submit complaints, file anonymous whistleblower reports, and track resolutions.
          </p>
        </div>

        {/* Primary Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {/* Submit Card */}
          <Link
            href="/submit"
            className="group relative bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-brand-500 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Anonymous Option
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                Submit a Grievance
              </h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                File a grievance regarding academic, infrastructure, or administrative issues. You can also file 100% anonymously with a Secret Key.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-sm font-semibold text-brand-600 group-hover:text-brand-700 gap-1.5">
              <span>File Grievance</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Track Card */}
          <Link
            href="/track"
            className="group relative bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md hover:border-brand-500 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  <Search className="h-6 w-6" />
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                  Real-time SLA
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                Track Grievance Status
              </h2>
              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Check live progress, stage timeline, and read official authority replies using your Ticket ID and Registered Email or Secret Key.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center text-sm font-semibold text-brand-600 group-hover:text-brand-700 gap-1.5">
              <span>Track Status</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Minimal SLA Trust Strip */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:pr-4 pt-2 sm:pt-0">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">48h Acknowledgment</p>
                <p className="text-[11px] text-gray-500">Official receipt guaranteed</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 sm:px-4 pt-2 sm:pt-0">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">7-Day Resolution</p>
                <p className="text-[11px] text-gray-500">Standard grievance timeline</p>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 sm:pl-4 pt-2 sm:pt-0">
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Whistleblower Shield</p>
                <p className="text-[11px] text-gray-500">100% confidential reporting</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} LAW CENTRE II, University of Delhi. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/submit" className="hover:text-brand-600 transition-colors">
              Submit Grievance
            </Link>
            <span>•</span>
            <Link href="/track" className="hover:text-brand-600 transition-colors">
              Track Status
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
