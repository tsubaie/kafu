import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionOrThrow } from "@/lib/authorization";

export const dynamic = "force-dynamic";

const MONTHLY_CREDITS = 5;

export async function GET() {
  try {
    const session = await getSessionOrThrow();

    const result = await query(
      `SELECT COALESCE(SUM(credits), 0)::int AS used
       FROM recognitions
       WHERE sender_id = $1
         AND created_at >= date_trunc('month', NOW())`,
      [session.user.id]
    );

    const used = result.rows[0].used;

    return NextResponse.json({
      total: MONTHLY_CREDITS,
      used,
      remaining: MONTHLY_CREDITS - used,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
    }
    console.error("[api/me/credits] GET error:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
