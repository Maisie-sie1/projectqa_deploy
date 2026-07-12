import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

// 1. GET /api/cart - Get all items in the user's cart
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" }, { status: 401 });
    }

    const items = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, session.userId),
      with: {
        book: true,
      },
    });

    return Response.json(items);
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการดึงตะกร้าสินค้า" }, { status: 500 });
  }
}

// 2. POST /api/cart - Add a book to the cart
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" }, { status: 401 });
    }

    const body = await req.json();
    const { bookId, quantity = 1 } = body;

    if (!bookId || typeof bookId !== "number" || quantity <= 0) {
      return Response.json({ error: "ข้อมูลสินค้าหรือจำนวนไม่ถูกต้อง" }, { status: 400 });
    }

    // Check if the item already exists in the user's cart
    const [existing] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, session.userId),
          eq(cartItems.bookId, bookId)
        )
      )
      .limit(1);

    if (existing) {
      // Update quantity
      await db
        .update(cartItems)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(cartItems.id, existing.id));
    } else {
      // Insert new item
      await db.insert(cartItems).values({
        userId: session.userId,
        bookId,
        quantity,
      });
    }

    return Response.json({ success: true, message: "เพิ่มหนังสือลงในตะกร้าเรียบร้อยแล้ว" });
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการเพิ่มสินค้าลงในตะกร้า" }, { status: 500 });
  }
}

// 3. DELETE /api/cart - Clear all items from the cart
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" }, { status: 401 });
    }

    await db
      .delete(cartItems)
      .where(eq(cartItems.userId, session.userId));

    return Response.json({ success: true, message: "ล้างตะกร้าสินค้าเรียบร้อยแล้ว" });
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการล้างตะกร้าสินค้า" }, { status: 500 });
  }
}
