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
            <div className="relative flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-brand-950 via-brand-850 to-brand-700 text-white shadow-md shadow-brand-950/20 border border-brand-700/50 group-hover:scale-105 transition-transform flex-shrink-0">
              <Scale className="h-5 w-5 text-amber-300 drop-shadow-sm" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 border border-white"></span>
              </span>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5 flex-wrap leading-tight">
                <span className="text-[12.5px] sm:text-[14.5px] font-black tracking-tight text-gray-950 uppercase font-sans">
                  Law Centre II
                </span>
                <span className="text-[9px] sm:text-[9.5px] font-bold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200/90 px-1.5 py-0.5 rounded-full shadow-xs">
                  Student Union
                </span>
              </div>
              <p className="text-[10px] sm:text-[11.5px] font-bold text-brand-600 tracking-wide uppercase mt-0.5 flex items-center gap-1.5 leading-none">
                <span>Grievance Portal</span>
                <span className="text-gray-300 hidden lg:inline">•</span>
                <span className="text-[10px] font-normal text-gray-400 capitalize tracking-normal hidden lg:inline">
                  Faculty of Law, DU
                </span>
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
