"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, FileText, Search, Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      {/* Institutional Apex Masthead */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-amber-400 tracking-wider uppercase">University of Delhi</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline">Faculty of Law</span>
            <span className="text-slate-600 hidden md:inline">•</span>
            <span className="text-slate-400 hidden md:inline">Estd. 1924</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="italic text-[10px] hidden sm:inline text-slate-400">Fiat Justitia Ruat Caelum</span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="text-amber-400/90 font-medium">UGC Redressal Regulations (2023)</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Brand */}
          <Link
            href="/portal"
            className="flex items-center gap-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-900 border border-amber-500/30 text-amber-400 shadow-sm group-hover:bg-slate-800 transition-colors flex-shrink-0">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm sm:text-base font-serif font-bold text-slate-900 leading-tight tracking-tight">
                  LAW CENTRE-II
                </p>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-300/60">
                  DU
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Student Grievance Redressal Committee
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/portal"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <span>Home</span>
            </Link>
            <Link
              href="/submit"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-sm transition-all"
            >
              <FileText className="h-4 w-4" />
              <span>Submit Grievance</span>
            </Link>
            <Link
              href="/track"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors border border-slate-200"
            >
              <Search className="h-4 w-4 text-slate-500" />
              <span>Docket Tracker</span>
            </Link>
          </nav>

          {/* Mobile Actions: Track button + Hamburger toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/track"
              className="p-2 text-gray-600 hover:text-brand-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Track Status"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-brand-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Scale className="h-4 w-4 text-amber-600" />
                Home & Charter
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>

            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-amber-50 text-amber-900 border border-amber-200/80 hover:bg-amber-100 transition-colors"
            >
              <span className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-amber-700" />
                Submit Grievance
              </span>
              <ArrowRight className="h-4 w-4 text-amber-700" />
            </Link>

            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Search className="h-4 w-4 text-slate-600" />
                Track Grievance Docket
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
