import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminSessionOrThrow } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSessionOrThrow();

    const { user_id, credits } = await request.json();
    if (!user_id || !credits || credits < 1) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const result = await query(
      `INSERT INTO bonus_credits (user_id, credits, granted_by, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, credits, expires_at`,
      [user_id, credits, session.user.id, expiresAt.toISOString()]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
    }
    console.error("[api/admin/bonus-credits] POST error:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
