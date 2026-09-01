import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionOrThrow } from "@/lib/authorization";
import { leaderboardQuerySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await getSessionOrThrow();

    const { searchParams } = request.nextUrl;
    const { period } = leaderboardQuerySchema.parse({
      period: searchParams.get("period") ?? "month",
    });

    const dateFilter =
      period === "month"
        ? `AND r.created_at >= date_trunc('month', NOW())`
        : "";

    const result = await query(
      `SELECT u.id AS user_id, u.name, u.department, u.avatar_url,
              COALESCE(SUM(r.credits), 0)::int AS total_credits,
              COUNT(r.id)::int AS recognition_count
       FROM users u
       LEFT JOIN recognitions r ON r.receiver_id = u.id ${dateFilter}
       WHERE u.is_active = TRUE
       GROUP BY u.id, u.name, u.department, u.avatar_url
       HAVING COALESCE(SUM(r.credits), 0) > 0
       ORDER BY total_credits DESC, recognition_count DESC, MIN(r.created_at) ASC
       LIMIT 10`
    );

    return NextResponse.json(result.rows);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
    }
    console.error("[api/leaderboard] GET error:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
