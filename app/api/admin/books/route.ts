import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { bookSchema } from "@/lib/validations";

// POST /api/admin/books - Create a new book
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return Response.json({ error: "ไม่มีสิทธิ์เข้าถึง (สำหรับผู้ดูแลระบบเท่านั้น)" }, { status: 403 });
    }

    const body = await req.json();
    const result = bookSchema.safeParse(body);
    if (!result.success) {
      return Response.json({ fieldErrors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const { coverImage } = body;

    const [newBook] = await db
      .insert(books)
      .values({
        ...result.data,
        originalPrice: result.data.originalPrice
          ? Number(result.data.originalPrice)
          : null,
        coverImage: coverImage || null,
      })
      .returning();

    return Response.json({
      success: true,
      message: "เพิ่มหนังสือเรียบร้อยแล้ว",
      book: newBook,
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการเพิ่มหนังสือ" }, { status: 500 });
  }
}
