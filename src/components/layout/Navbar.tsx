"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, FileText, Search, Menu, X, ArrowRight } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link
            href="/portal"
            className="flex items-center gap-2.5 sm:gap-3 group"
            onClick={() => setMobileMenuOpen(false)}
          >
            {/* Seal / Crest */}
            <div className="flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 text-amber-400 shadow-sm border border-amber-500/25 group-hover:border-amber-400/50 group-hover:scale-105 transition-all flex-shrink-0">
              <Scale className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-amber-400 drop-shadow-xs" />
            </div>

            {/* Typography */}
            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 leading-none whitespace-nowrap">
                <span className="text-[13.5px] sm:text-[16px] font-black tracking-tight text-slate-950 uppercase font-sans">
                  Law Centre II
                </span>
                <span className="text-slate-300 font-light text-xs sm:text-sm">|</span>
                <span className="text-[11.5px] sm:text-[13.5px] font-extrabold text-amber-700 uppercase tracking-tight">
                  Student Union
                </span>
              </div>
              <p className="text-[9.5px] sm:text-[11px] font-extrabold text-brand-700 tracking-[0.18em] uppercase mt-1 leading-none">
                Grievance Portal
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              href="/submit"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Submit Grievance</span>
            </Link>
            <Link
              href="/track"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span>Track Status</span>
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
        <div className="md:hidden border-t border-gray-100 bg-white shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-2">
            <Link
              href="/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Scale className="h-4 w-4 text-brand-600" />
                Home
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>

            <Link
              href="/submit"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <span className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-brand-600" />
                Submit Grievance
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>

            <Link
              href="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <span className="flex items-center gap-3">
                <Search className="h-4 w-4 text-brand-600" />
                Track Grievance Status
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
