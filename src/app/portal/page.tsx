import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import {
  Scale,
  FileText,
  Search,
  ShieldCheck,
  Clock,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Gavel,
  Landmark,
  ScrollText,
  Lock,
  Building2,
  AlertTriangle,
  Mail,
  MapPin,
  ChevronRight,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Student Grievance Redressal Committee | Law Centre-II, Faculty of Law, University of Delhi",
  description:
    "Official statutory portal for student grievance redressal, natural justice compliance, and academic accountability at Law Centre-II, Faculty of Law, University of Delhi.",
};

export const revalidate = 3600;

const NATURAL_JUSTICE_PILLARS = [
  {
    latin: "Audi Alteram Partem",
    title: "Right to Fair Hearing",
    description:
      "Every petitioner is guaranteed procedural fairness, the right to place facts on record, and an unbiased evaluation of documented representations.",
    icon: Scale,
    tag: "Rule of Fair Hearing",
  },
  {
    latin: "Nemo Judex In Causa Sua",
    title: "Rule Against Bias",
    description:
      "Strict conflict-of-interest and mandatory recusal safeguards prevent any authority with a personal or administrative stake from adjudicating.",
    icon: Gavel,
    tag: "Impartial Adjudication",
  },
  {
    latin: "Rationes Decidendi",
    title: "Reasoned Speaking Orders",
    description:
      "Arbitrary dismissals are barred by statute. Every disposal mandates a speaking written order articulating findings of fact and applicable ordinances.",
    icon: ScrollText,
    tag: "Institutional Transparency",
  },
  {
    latin: "Securitas Whistleblower",
    title: "Confidentiality & Immunity",
    description:
      "End-to-end identity shielding with cryptographic secret keys guarantees scholars can report harassment or unfair practices without fear of academic reprisal.",
    icon: Lock,
    tag: "Whistleblower Protection",
  },
];

const JURISDICTION_AREAS = [
  {
    title: "Academic & Curricular Petitions",
    description:
      "Attendance shortage condonation, internal assessment disparities, syllabus coverage, and LL.B. curriculum delivery.",
    code: "Statute 12(A)",
    icon: BookOpen,
  },
  {
    title: "Examinations & Result Discrepancies",
    description:
      "Admit card clearances, marksheet rectifications, revaluation timeline appeals, and provisional degree issuance.",
    code: "Ord. VIII-E",
    icon: Award,
  },
  {
    title: "Faculty Pedagogy & Tutorials",
    description:
      "Class timetables, clinical legal education, tutorial grouping, and court visit / moot court credit recording.",
    code: "Bar Council Norms",
    icon: Landmark,
  },
  {
    title: "Anti-Ragging & POSH (ICC)",
    description:
      "Expedited statutory inquiry into campus harassment, ragging, or discriminatory bias under UGC Regulations & ICC policy.",
    code: "UGC Reg. 2009 / 2023",
    icon: AlertTriangle,
  },
  {
    title: "Library & Legal Research Databases",
    description:
      "Access to SCC Online, Manupatra, LexisNexis, reading hall accommodations, and e-resource remote credentials.",
    code: "Library Statute",
    icon: Building2,
  },
  {
    title: "Registry & Administrative Services",
    description:
      "Fee reconciliation, migration certificates, character certificates, student identity cards, and concession passes.",
    code: "Admin Code LC-II",
    icon: ScrollText,
  },
];

const PROCEDURAL_STAGES = [
  {
    stage: "01",
    phase: "Formal Docketing",
    timing: "Immediate",
    title: "Petition Registration & Docket Generation",
    description:
      "Student lodges petition with documentary exhibits. The system assigns a unique institutional Docket ID (e.g., GRV-2026-0001) and an encrypted Secret Tracking Key for anonymous filings.",
    icon: FileText,
  },
  {
    stage: "02",
    phase: "Statutory Scrutiny",
    timing: "Within 48 Hours",
    title: "Prima Facie Review & Committee Assignment",
    description:
      "The SGRC Secretariat examines jurisdictional competency, issues an official statutory acknowledgment, and forwards the docket to the designated Convener or Section Officer.",
    icon: Clock,
  },
  {
    stage: "03",
    phase: "Fact-Finding Inquiry",
    timing: "Days 3 to 5",
    title: "Examination of Records & Due Process",
    description:
      "The assigned authority scrutinizes academic records, calls for remarks from relevant departments, and accords a fair hearing in compliance with principles of natural justice.",
    icon: Scale,
  },
  {
    stage: "04",
    phase: "Final Adjudication",
    timing: "Within 7 Days",
    title: "Reasoned Speaking Order & Disposal",
    description:
      "A formal written order is entered into the permanent audit ledger and transmitted to the student's docket. Full rights of appellate review to the Dean / University Ombudsperson remain intact.",
    icon: CheckCircle,
  },
];

const FAQS = [
  {
    q: "Who constitutes the Student Grievance Redressal Committee (SGRC)?",
    a: "The SGRC at Law Centre-II is a statutory body constituted as per UGC Regulations (2023), comprising senior professors of law, faculty conveners, administrative officers, and a special student representative.",
  },
  {
    q: "How does the Anonymous / Whistleblower Protection route operate?",
    a: "When filing anonymously, your name, roll number, and phone number are completely stripped from administrative records. You receive a cryptographic Secret Key (SEC-XXXX-XXXX) that serves as your sole access credential to view official orders at /track.",
  },
  {
    q: "What recourse is available if I am dissatisfied with the SGRC decision?",
    a: "Pursuant to UGC Regulations 2023, any student aggrieved by an order of the SGRC has the statutory right to prefer an appeal before the Ombudsperson of the University of Delhi within 15 days of disposal.",
  },
  {
    q: "Can I upload affidavits or supporting documents with my grievance?",
    a: "Yes. Supporting PDFs, official notifications, marksheet scans, or evidentiary materials can be securely uploaded with your petition at the time of submission.",
  },
];

export default function PortalLandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      {/* Hero Section: Distinguished Academic Legal Masthead */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-b border-amber-500/20">
        {/* Subtle Architectural Grid & Glow */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
          <div
            className="h-full w-full opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(#d97706 1px, transparent 1px), radial-gradient(#6366f1 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              backgroundPosition: "0 0, 16px 16px",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="max-w-4xl">
            {/* Top Institutional Crest Badge */}
            <div className="inline-flex items-center gap-2.5 bg-slate-900/90 border border-amber-500/40 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium mb-6 backdrop-blur-sm shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-300 font-semibold tracking-wide uppercase text-[11px] sm:text-xs">
                Faculty of Law • University of Delhi
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-300 hidden sm:inline text-xs italic font-serif">
                “Dharmo Rakshati Rakshitah”
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-[1.15] mb-6">
              Student Grievance <br />
              <span className="text-amber-400 italic">Redressal Committee</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl font-sans font-medium text-slate-300 mt-2">
                Law Centre-II
              </span>
            </h1>

            {/* Academic Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mb-8 sm:mb-10 leading-relaxed font-light">
              The statutory institutional mechanism constituted under the{" "}
              <strong className="text-white font-medium">
                UGC (Redressal of Grievances of Students) Regulations, 2023
              </strong>{" "}
              and the Ordinances of the University of Delhi. Dedicated to upholding the principles of natural
              justice, procedural impartiality, and time-bound accountability for all scholars of law.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-10">
              <Link
                href="/submit"
                className="inline-flex items-center justify-center gap-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-7 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-amber-500/20 text-sm sm:text-base group"
              >
                <FileText className="h-5 w-5 text-slate-950" />
                <span>Lodge Formal Grievance</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/track"
                className="inline-flex items-center justify-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-medium px-6 py-3.5 rounded-xl transition-all text-sm sm:text-base backdrop-blur-sm"
              >
                <Search className="h-4 w-4 text-amber-400" />
                <span>Track Docket Status</span>
              </Link>

              <Link
                href="/submit?anonymous=true"
                className="inline-flex items-center justify-center gap-2 bg-slate-950/60 hover:bg-slate-900 border border-amber-500/30 text-amber-300/90 hover:text-amber-200 font-medium px-5 py-3.5 rounded-xl transition-all text-sm"
              >
                <Lock className="h-4 w-4 text-amber-400" />
                <span>Whistleblower Route</span>
              </Link>
            </div>

            {/* Statutory Compliance Bar */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Scale className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>UGC Regs (2023) Aligned</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>48h Statutory Notice</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ScrollText className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>Reasoned Written Orders</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>Bar Council Standards</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statutory Procedural Charter Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-amber-950">
          <div className="flex items-center gap-2.5 font-medium">
            <span className="p-1 rounded bg-amber-500 text-slate-950 font-serif font-bold text-[11px]">LEX</span>
            <span>
              <strong>Statutory Redressal Window:</strong> Formal acknowledgment within 48 hours • Binding resolution
              within 7 calendar days.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-amber-900">
            <span>Room 104, Umang Bhawan</span>
            <span>•</span>
            <span>Chhatra Marg, North Campus</span>
          </div>
        </div>
      </div>

      {/* Jurisprudential Foundations: The 4 Pillars of Natural Justice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-amber-800 bg-amber-100 border border-amber-300/60 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-wider mb-3">
            <Scale className="h-3.5 w-3.5" />
            <span>Jurisprudential Foundations</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 mb-4">
            The Pillars of Natural Justice
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
            Every inquiry conducted by the Student Grievance Redressal Committee is strictly anchored in procedural
            fairness, administrative equity, and constitutional safeguards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {NATURAL_JUSTICE_PILLARS.map((pillar) => (
            <div
              key={pillar.latin}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-amber-400/50 transition-all flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-slate-900 text-amber-400">
                  <pillar.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  {pillar.tag}
                </span>
              </div>
              <p className="text-xs font-serif italic text-amber-800 font-semibold mb-1">{pillar.latin}</p>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2">{pillar.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-auto font-light">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Competencies & Subject Jurisdiction */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-amber-800 tracking-wider uppercase bg-amber-100 border border-amber-300/50 px-3 py-1 rounded-full">
                Statutory Scope
              </span>
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 mt-3 mb-2">
                Jurisdiction & Redressal Competencies
              </h2>
              <p className="text-sm sm:text-base text-slate-600 max-w-xl font-light">
                The SGRC is authorized to take cognizance of grievances arising under the following academic,
                administrative, and campus spheres.
              </p>
            </div>
            <Link
              href="/submit"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:text-amber-700 transition-colors"
            >
              <span>View filing guidelines</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {JURISDICTION_AREAS.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 shadow-sm hover:border-slate-300 transition-all group"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 group-hover:bg-slate-900 group-hover:text-amber-400 transition-colors">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {item.code}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-slate-900 text-base sm:text-lg mb-1.5">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Adjudication Process: Procedural Lifecycle */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-slate-600 tracking-wider uppercase bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
            Due Process of Law
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 mt-3 mb-3">
            Procedural Redressal Lifecycle
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-light">
            Every docket moves through a transparent, time-bound four-tier administrative inquiry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PROCEDURAL_STAGES.map((step) => (
            <div
              key={step.stage}
              className="relative bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                  {step.phase}
                </span>
                <span className="text-2xl font-serif font-black text-slate-200">{step.stage}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                <step.icon className="h-3.5 w-3.5 text-amber-600" />
                <span>{step.timing}</span>
              </div>
              <h3 className="font-serif font-bold text-slate-900 text-base mb-2">{step.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light mt-auto">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Whistleblower Protection Spotlight Banner */}
      <section className="bg-slate-900 text-white border-y border-amber-500/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
              <Lock className="h-3.5 w-3.5" />
              <span>Confidential Whistleblower Protocol</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-3">
              Safeguarding Complainant Immunity
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Students reporting sensitive grievances—such as ragging, gender-based harassment, or unfair academic
              victimization—may invoke statutory anonymity. Personal identifiers are permanently stripped from the
              docket, and a cryptographic tracking token enables secure tracking without identity disclosure.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-shrink-0">
            <Link
              href="/submit?anonymous=true"
              className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-colors text-sm text-center"
            >
              <Lock className="h-4 w-4" />
              <span>File Anonymously</span>
            </Link>
            <Link
              href="/track"
              className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium px-6 py-3 rounded-xl transition-colors text-sm text-center"
            >
              <Search className="h-4 w-4" />
              <span>Track Secret Key</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Academic & Regulatory FAQs */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-amber-800 tracking-wider uppercase bg-amber-100 border border-amber-300/50 px-3 py-1 rounded-full">
            Statutory FAQs
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-slate-900 mt-3 mb-3">
            Questions on Grievance Redressal
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-light">
            Essential information regarding committee jurisdiction, procedure, and rights of appeal.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div key={faq.q} className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm">
              <h4 className="font-serif font-bold text-slate-900 text-base sm:text-lg mb-2 flex items-start gap-2.5">
                <span className="text-amber-700 font-sans font-bold">Q.</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Secretariat Contact & Academic Directory */}
      <section className="bg-slate-100 border-t border-slate-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-lg bg-slate-900 text-amber-400">
                <Scale className="h-5 w-5" />
              </div>
              <div>
                <p className="font-serif font-bold text-slate-900">Law Centre-II</p>
                <p className="text-xs text-slate-500">Faculty of Law, University of Delhi</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              Constituted under UGC (Redressal of Grievances of Students) Regulations, 2023. Promoting academic
              fairness and institutional accountability.
            </p>
          </div>

          <div>
            <h4 className="font-serif font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-amber-700" />
              <span>Secretariat Location</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-light">
              Office of the Convener, SGRC <br />
              Umang Bhawan, Chhatra Marg <br />
              North Campus, University of Delhi <br />
              Delhi – 110007, India
            </p>
          </div>

          <div>
            <h4 className="font-serif font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-amber-700" />
              <span>Contact & Working Hours</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-light mb-1">
              Email:{" "}
              <a href="mailto:grievance@lc2.du.ac.in" className="text-amber-800 font-medium hover:underline">
                grievance@lc2.du.ac.in
              </a>
            </p>
            <p className="text-xs text-slate-500 font-light">
              Hours: Monday – Friday | 09:30 AM to 05:00 PM <br />
              (Excluding University Gazetted Holidays)
            </p>
          </div>
        </div>
      </section>

      {/* Dignified Legal Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Student Grievance Redressal Committee, Law Centre-II, Faculty of Law,
            University of Delhi. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/portal" className="hover:text-amber-400 transition-colors">
              Charter
            </Link>
            <span>•</span>
            <Link href="/submit" className="hover:text-amber-400 transition-colors">
              Submit Grievance
            </Link>
            <span>•</span>
            <Link href="/track" className="hover:text-amber-400 transition-colors">
              Docket Tracker
            </Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-amber-400 transition-colors">
              Committee Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
