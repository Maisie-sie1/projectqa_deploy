import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

// DELETE /api/admin/books/[id] - Delete a book
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return Response.json({ error: "ไม่มีสิทธิ์เข้าถึง (สำหรับผู้ดูแลระบบเท่านั้น)" }, { status: 403 });
    }

    const { id } = await params;
    const bookId = parseInt(id, 10);
    if (isNaN(bookId)) {
      return Response.json({ error: "รหัสหนังสือไม่ถูกต้อง" }, { status: 400 });
    }

    const result = await db
      .delete(books)
      .where(eq(books.id, bookId))
      .returning();

    if (result.length === 0) {
      return Response.json({ error: "ไม่พบหนังสือที่ต้องการลบ" }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: "ลบหนังสือเรียบร้อยแล้ว",
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการลบหนังสือ" }, { status: 500 });
  }
}
