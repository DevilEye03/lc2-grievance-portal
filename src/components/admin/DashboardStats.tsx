import { Card } from "@/components/ui/Card";
import type { DashboardStats as Stats } from "@/types";
import { CATEGORIES } from "@/lib/validations";
import {
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

interface DashboardStatsProps {
  stats: Stats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const kpis = [
    {
      label: "Total This Month",
      value: stats.totalThisMonth,
      icon: FileText,
      color: "text-brand-600",
      bg: "bg-brand-50",
    },
    {
      label: "Active / Pending",
      value: stats.activePending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "SLA Breaches",
      value: stats.slaBreached,
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      label: "Avg. Resolution (days)",
      value: stats.avgResolutionDays,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  const totalCategory = Object.values(stats.byCategory).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} padding="md">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${kpi.bg} flex-shrink-0`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Complaints by Category
          </h3>
          <div className="space-y-3">
            {CATEGORIES.map(({ value, label }) => {
              const count = stats.byCategory[value] || 0;
              const pct = Math.round((count / totalCategory) * 100);
              return (
                <div key={value}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
            Complaints by Status
          </h3>
          <div className="space-y-3">
            {[
              { key: "REGISTERED", label: "Registered", color: "bg-gray-400" },
              { key: "ACKNOWLEDGED", label: "Acknowledged", color: "bg-blue-400" },
              { key: "IN_PROGRESS", label: "In Progress", color: "bg-amber-400" },
              { key: "RESOLVED", label: "Resolved", color: "bg-emerald-500" },
              { key: "CLOSED", label: "Closed", color: "bg-slate-400" },
            ].map(({ key, label, color }) => {
              const count = stats.byStatus[key] || 0;
              const total = Object.values(stats.byStatus).reduce((a, b) => a + b, 0) || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{label}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
