import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/health — Keep-alive heartbeat & system health check
export async function GET() {
  const startTime = Date.now();
  try {
    // Lightweight database ping to keep serverless compute instances active
    await prisma.$queryRawUnsafe("SELECT 1");
    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        region: "bom1",
        latencyMs: duration,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "degraded",
        database: "disconnected",
        latencyMs: duration,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
