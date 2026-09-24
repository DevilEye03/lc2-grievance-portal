"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Scale,
  Menu,
  X,
  LogOut,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/complaints", icon: FileText, label: "Complaints" },
  { href: "/admin/whatsapp-simulator", icon: MessageSquare, label: "WhatsApp Bot" },
  { href: "/admin/users", icon: Users, label: "User Management" },
];

interface AdminShellProps {
  userName: string;
  userRole: string;
  children: React.ReactNode;
}

export function AdminShell({ userName, userRole, children }: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50">
      {/* ─── Mobile Header (md:hidden) ─── */}
      <header className="md:hidden flex items-center justify-between h-14 px-4 bg-brand-950 text-white border-b border-brand-800 z-30 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-brand-900 text-brand-200 hover:text-white transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-brand-600 flex items-center justify-center flex-shrink-0">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">LAW CENTRE II</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/portal"
            target="_blank"
            className="p-1.5 rounded-lg text-brand-300 hover:text-white hover:bg-brand-900 transition-colors"
            title="View Student Portal"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
          <div className="h-7 w-7 rounded-full bg-brand-700 flex items-center justify-center text-xs font-semibold text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* ─── Mobile Drawer Overlay & Sidebar (md:hidden) ─── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Dimmed backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-out drawer */}
          <aside className="relative flex flex-col w-72 max-w-[80vw] h-full bg-brand-950 text-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-brand-800">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center">
                  <Scale className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">LAW CENTRE II</p>
                  <p className="text-[11px] text-brand-400">Grievance Portal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-brand-300 hover:text-white hover:bg-brand-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                if (item.href === "/admin/users" && userRole !== "SUPER_ADMIN") return null;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                      active
                        ? "bg-brand-600 text-white shadow-sm font-semibold"
                        : "text-brand-300 hover:bg-brand-800 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Info & Actions */}
            <div className="border-t border-brand-800 p-4 space-y-2">
              <div className="px-2 py-1">
                <p className="text-sm font-semibold text-white truncate">{userName}</p>
                <p className="text-xs text-brand-400 font-medium capitalize">
                  {userRole.toLowerCase().replace("_", " ")}
                </p>
              </div>

              <Link
                href="/portal"
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-brand-300 hover:bg-brand-800 hover:text-white transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <ExternalLink className="h-4 w-4" />
                <span>Visit Student Portal</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/50 hover:text-rose-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Desktop Docked Sidebar (hidden md:flex) ─── */}
      <aside
        className={cn(
          "hidden md:flex relative flex-col h-full bg-brand-950 text-white transition-all duration-300 flex-shrink-0",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-brand-800">
          <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center">
            <Scale className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">LAW CENTRE II</p>
              <p className="text-xs text-brand-400">Grievance Portal</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-14 h-6 w-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-700 z-10"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            if (item.href === "/admin/users" && userRole !== "SUPER_ADMIN") return null;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-700 text-white"
                    : "text-brand-300 hover:bg-brand-800 hover:text-white"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-brand-800 p-3">
          {!collapsed && (
            <div className="px-2 py-2 mb-2">
              <p className="text-sm font-medium text-white truncate">{userName}</p>
              <p className="text-xs text-brand-400 capitalize">{userRole.toLowerCase().replace("_", " ")}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-brand-300 hover:bg-brand-800 hover:text-white transition-colors"
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
