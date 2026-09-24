"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, FileText, Search, ShieldCheck, Menu, X, ArrowRight } from "lucide-react";

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
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-brand-600 text-white shadow-sm group-hover:bg-brand-700 transition-colors flex-shrink-0">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">LAW CENTRE II</p>
              <p className="text-[10px] sm:text-xs text-brand-600 font-medium">Grievance Portal</p>
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
            <Link
              href="/admin"
              className="flex items-center gap-1.5 ml-2 px-3.5 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Admin Portal</span>
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

            <div className="pt-2 border-t border-gray-100">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors shadow-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Portal Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
