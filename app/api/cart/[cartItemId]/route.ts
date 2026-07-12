import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

// 1. PUT /api/cart/[cartItemId] - Update cart item quantity
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ cartItemId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" }, { status: 401 });
    }

    const { cartItemId } = await params;
    const itemId = parseInt(cartItemId, 10);
    if (isNaN(itemId)) {
      return Response.json({ error: "รหัสรายการในตะกร้าไม่ถูกต้อง" }, { status: 400 });
    }

    const body = await req.json();
    const { quantity } = body;

    if (typeof quantity !== "number") {
      return Response.json({ error: "จำนวนไม่ถูกต้อง" }, { status: 400 });
    }

    if (quantity <= 0) {
      // Delete the item if quantity is 0 or less
      await db
        .delete(cartItems)
        .where(
          and(
            eq(cartItems.id, itemId),
            eq(cartItems.userId, session.userId)
          )
        );
      return Response.json({ success: true, message: "ลบสินค้าออกจากตะกร้าแล้ว" });
    }

    // Update quantity
    const result = await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.id, itemId),
          eq(cartItems.userId, session.userId)
        )
      )
      .returning();

    if (result.length === 0) {
      return Response.json({ error: "ไม่พบรายการสินค้าในตะกร้าของคุณ" }, { status: 404 });
    }

    return Response.json({ success: true, message: "อัปเดตจำนวนสินค้าเรียบร้อยแล้ว" });
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการอัปเดตตะกร้าสินค้า" }, { status: 500 });
  }
}

// 2. DELETE /api/cart/[cartItemId] - Remove item from cart
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ cartItemId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" }, { status: 401 });
    }

    const { cartItemId } = await params;
    const itemId = parseInt(cartItemId, 10);
    if (isNaN(itemId)) {
      return Response.json({ error: "รหัสรายการในตะกร้าไม่ถูกต้อง" }, { status: 400 });
    }

    const result = await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.id, itemId),
          eq(cartItems.userId, session.userId)
        )
      )
      .returning();

    if (result.length === 0) {
      return Response.json({ error: "ไม่พบรายการสินค้าในตะกร้าของคุณ" }, { status: 404 });
    }

    return Response.json({ success: true, message: "ลบสินค้าออกจากตะกร้าเรียบร้อยแล้ว" });
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการลบสินค้าออกจากตะกร้า" }, { status: 500 });
  }
}
