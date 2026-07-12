import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookId = parseInt(id, 10);
    if (isNaN(bookId)) {
      return Response.json({ error: "รหัสหนังสือไม่ถูกต้อง" }, { status: 400 });
    }

    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.id, bookId))
      .limit(1);

    if (!book) {
      return Response.json({ error: "ไม่พบหนังสือที่ระบุ" }, { status: 404 });
    }

    return Response.json(book);
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการดึงรายละเอียดหนังสือ" }, { status: 500 });
  }
}
