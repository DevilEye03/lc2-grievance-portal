import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { FileText, Search, ShieldCheck, Clock, CheckCircle, ArrowRight, Scale } from "lucide-react";

export const metadata: Metadata = { title: "Home" };

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Submit Your Grievance",
    desc: "Fill out the simple form with your details and description of your complaint. Upload supporting documents if any.",
    icon: FileText,
    color: "bg-brand-100 text-brand-600",
  },
  {
    step: "02",
    title: "Receive Your Ticket ID",
    desc: "Instantly get a unique Ticket ID (e.g., GRV-2026-0001). The authority must acknowledge within 48 hours.",
    icon: Clock,
    color: "bg-amber-100 text-amber-600",
  },
  {
    step: "03",
    title: "Track in Real-Time",
    desc: "Use your Ticket ID and email to track the live status and official resolution at any time, no login required.",
    icon: Search,
    color: "bg-purple-100 text-purple-600",
  },
  {
    step: "04",
    title: "Receive Official Resolution",
    desc: "The assigned authority posts a mandatory official response. You are notified by email at every step.",
    icon: CheckCircle,
    color: "bg-emerald-100 text-emerald-600",
  },
];

export default function PortalLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 text-white">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3.5 py-1 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <Scale className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>Official Grievance Redressal System</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 sm:mb-6">
              LAW CENTRE II
              <br />
              <span className="text-brand-300">Grievance Portal</span>
            </h1>
            <p className="text-base sm:text-xl text-brand-100 max-w-xl mb-8 sm:mb-10 leading-relaxed">
              A transparent, accountable, and time-bound system for resolving student grievances.
              Every complaint gets a unique Ticket ID and a mandatory official response.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-lg text-sm sm:text-base w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Submit Grievance
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/track"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                Track Status
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SLA Commitment Banner */}
      <div className="bg-amber-50 border-y border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-amber-900">
            <div className="flex items-center justify-center sm:justify-start gap-2 font-medium">
              <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span>Acknowledgment within 48 hours</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Resolution within 7 calendar days</span>
            </div>
            <div className="flex items-center justify-center sm:justify-end gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
              <span>Mandatory official authority response</span>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center mb-8 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">How It Works</h2>
          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto px-2">
            Your grievance is handled through a structured, transparent, and time-bound process.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                <div className={`p-2.5 rounded-xl ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="text-2xl sm:text-3xl font-black text-gray-200">{item.step}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5 text-base sm:text-lg">{item.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">Have a grievance? We&apos;re here to help.</h2>
          <p className="text-sm sm:text-base text-brand-100 mb-6 max-w-md mx-auto">
            Submit now and receive your Ticket ID instantly. Track resolution updates 24/7.
          </p>
          <Link
            href="/submit"
            className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 hover:bg-brand-50 font-semibold px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl transition-colors shadow text-sm sm:text-base w-full sm:w-auto"
          >
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
            File a Grievance
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs sm:text-sm">
          <p>© {new Date().getFullYear()} LAW CENTRE II Grievance Portal. All rights reserved.</p>
          <p className="mt-2 flex items-center justify-center gap-4">
            <Link href="/track" className="hover:text-white transition-colors">
              Track Status
            </Link>
            <span>•</span>
            <Link href="/submit" className="hover:text-white transition-colors">
              Submit Complaint
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin Portal
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
