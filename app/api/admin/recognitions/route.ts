import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAdminSessionOrThrow } from "@/lib/authorization";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

export async function GET(request: NextRequest) {
  try {
    await getAdminSessionOrThrow();

    const { searchParams } = request.nextUrl;
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const search = searchParams.get("q") ?? "";

    const searchFilter = search
      ? `AND (s.name ILIKE $1 OR rv.name ILIKE $1)`
      : "";
    const searchParam = search ? `%${search}%` : null;

    const [dataResult, countResult] = await Promise.all([
      query(
        `SELECT r.id, r.credits, r.badge, r.message, r.created_at,
                s.name AS sender_name, s.department AS sender_department,
                rv.name AS receiver_name, rv.department AS receiver_department
         FROM recognitions r
         JOIN users s ON s.id = r.sender_id
         JOIN users rv ON rv.id = r.receiver_id
         WHERE TRUE ${searchFilter}
         ORDER BY r.created_at DESC
         LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
        searchParam ? [searchParam] : []
      ),
      query(
        `SELECT COUNT(*)::int AS total
         FROM recognitions r
         JOIN users s ON s.id = r.sender_id
         JOIN users rv ON rv.id = r.receiver_id
         WHERE TRUE ${searchFilter}`,
        searchParam ? [searchParam] : []
      ),
    ]);

    return NextResponse.json({
      items: dataResult.rows,
      total: countResult.rows[0].total,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
    }
    console.error("[api/admin/recognitions] GET error:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await getAdminSessionOrThrow();

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "معرّف مطلوب" }, { status: 400 });
    }

    const result = await query(
      `DELETE FROM recognitions WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ deleted: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "غير مصرّح" }, { status: 401 });
    }
    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "غير مسموح" }, { status: 403 });
    }
    console.error("[api/admin/recognitions] DELETE error:", err);
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}
