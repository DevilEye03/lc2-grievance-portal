import Link from "next/link";
import Image from "next/image";
import { Lock } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200/80 bg-white/90 backdrop-blur-md py-6 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="relative h-5 w-5 rounded-md overflow-hidden border border-amber-500/35 bg-slate-950 flex-shrink-0 shadow-2xs">
            <Image
              src="/images/logo.jpg"
              alt="Law Centre II Logo"
              fill
              sizes="20px"
              className="object-cover"
            />
          </div>
          <p>© {new Date().getFullYear()} Law Centre II Student Union. All rights reserved.</p>
        </div>
        <div className="flex items-center gap-3.5 sm:gap-4">
          <Link href="/submit" className="hover:text-brand-600 transition-colors">
            Submit Grievance
          </Link>
          <span>•</span>
          <Link href="/track" className="hover:text-brand-600 transition-colors">
            Track Status
          </Link>
          <span>•</span>
          <Link
            href="/admin/login"
            className="hover:text-brand-600 transition-colors inline-flex items-center gap-1 text-gray-600 hover:text-brand-700 font-medium"
          >
            <Lock className="h-3 w-3" />
            <span>Admin Portal</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
