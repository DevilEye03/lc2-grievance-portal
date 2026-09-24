"use client";

import { cn } from "@/lib/utils";

type BadgeVariant =
  | "REGISTERED"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "SLA_BREACH"
  | "default";

const variantMap: Record<BadgeVariant, string> = {
  REGISTERED: "bg-gray-100 text-gray-800 border-gray-300",
  ACKNOWLEDGED: "bg-blue-100 text-blue-800 border-blue-300",
  IN_PROGRESS: "bg-amber-100 text-amber-800 border-amber-300",
  RESOLVED: "bg-emerald-100 text-emerald-800 border-emerald-300",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-300",
  SLA_BREACH: "bg-rose-100 text-rose-800 border-rose-300 font-semibold",
  default: "bg-gray-100 text-gray-700 border-gray-300",
};

const labelMap: Record<string, string> = {
  REGISTERED: "Registered",
  ACKNOWLEDGED: "Acknowledged",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
  SLA_BREACH: "SLA Breached",
};

interface BadgeProps {
  status: string;
  pulse?: boolean;
  className?: string;
}

export function Badge({ status, pulse = false, className }: BadgeProps) {
  const variant = (variantMap[status as BadgeVariant] ?? variantMap.default);
  const label = labelMap[status] ?? status;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        variant,
        pulse && "animate-pulse",
        className
      )}
    >
      {label}
    </span>
  );
}

export function SLABadge({ slaDueDate, status }: { slaDueDate: Date | string; status: string }) {
  if (status === "RESOLVED" || status === "CLOSED") return null;

  const now = Date.now();
  const due = new Date(slaDueDate).getTime();
  const hoursLeft = (due - now) / (1000 * 60 * 60);

  if (hoursLeft < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border bg-rose-100 text-rose-800 border-rose-300 animate-pulse">
        ⚠ SLA Breached
      </span>
    );
  }

  if (hoursLeft < 24) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-amber-100 text-amber-800 border-amber-300">
        ⏰ {Math.ceil(hoursLeft)}h left
      </span>
    );
  }

  const daysLeft = Math.ceil(hoursLeft / 24);
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
      ✓ {daysLeft}d left
    </span>
  );
}
