import { NextResponse } from "next/server";
import { isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbOk = await isDatabaseAvailable();
  return NextResponse.json({
    status: dbOk ? "healthy" : "degraded",
    database: dbOk,
    timestamp: new Date().toISOString(),
  });
}
