import Link from "next/link";
import { Scale, FileText, Search, ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/portal" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-brand-600 text-white shadow-sm group-hover:bg-brand-700 transition-colors">
              <Scale className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-tight">LAW CENTRE II</p>
              <p className="text-xs text-brand-600 font-medium">Grievance Portal</p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-1">
            <Link
              href="/submit"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Submit Grievance</span>
              <span className="sm:hidden">Submit</span>
            </Link>
            <Link
              href="/track"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Track Status</span>
              <span className="sm:hidden">Track</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 ml-2 px-3 py-2 rounded-lg text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Admin Portal</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
