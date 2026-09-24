"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RotateCcw, AlertCircle, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center p-6 sm:p-8">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-rose-100 text-rose-600 mb-4 shadow-xs">
          <AlertCircle className="h-7 w-7" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Temporary Connection Delay</h2>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          The service is experiencing a brief connection delay. Please tap retry to reload the page.
        </p>

        {error.digest && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-6 text-xs font-mono text-gray-500">
            Error ID: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => reset()} className="w-full sm:w-auto">
            <RotateCcw className="h-4 w-4" />
            Retry
          </Button>

          <Link href="/portal" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
