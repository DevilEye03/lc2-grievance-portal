"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Scale,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/complaints", icon: FileText, label: "Complaints" },
  { href: "/admin/whatsapp-simulator", icon: MessageSquare, label: "WhatsApp Bot" },
  { href: "/admin/users", icon: Users, label: "User Management" },
];

interface AdminSidebarProps {
  userRole: string;
  userName: string;
}

export function AdminSidebar({ userRole, userName }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-brand-950 text-white transition-all duration-300",
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
        {collapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          // Hide user management for non-super-admins
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
            <p className="text-xs text-brand-400">{userRole.replace("_", " ")}</p>
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
  );
}
