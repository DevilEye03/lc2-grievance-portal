"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Database, RotateCcw, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error captured:", error);
  }, [error]);

  const isDbConnection =
    error.message?.includes("database server") ||
    error.message?.includes("Can't reach") ||
    error.message?.includes("ETIMEDOUT") ||
    error.message?.includes("PrismaClient") ||
    error.digest?.includes("2759778103");

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-6 sm:p-8">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-100 text-amber-600 mb-4 shadow-xs">
          {isDbConnection ? <Database className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7" />}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isDbConnection ? "Database Reconnecting" : "Something went wrong"}
        </h2>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          {isDbConnection
            ? "The serverless database is currently waking up from an idle state. This usually takes just a couple seconds to reconnect."
            : "An unexpected error occurred while loading this section."}
        </p>

        {error.digest && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-6 text-xs font-mono text-gray-500">
            Error ID: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => reset()} className="w-full sm:w-auto">
            <RotateCcw className="h-4 w-4" />
            Try Again
          </Button>

          <Link href="/portal" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" />
              Student Portal
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
