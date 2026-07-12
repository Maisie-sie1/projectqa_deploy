import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" }, { status: 401 });
    }

    const { orderId } = await params;
    const id = parseInt(orderId, 10);
    if (isNaN(id)) {
      return Response.json({ error: "รหัสคำสั่งซื้อไม่ถูกต้อง" }, { status: 400 });
    }

    const body = await req.json();
    const { base64Image } = body;

    if (!base64Image) {
      return Response.json({ error: "กรุณาส่งรูปภาพสลิปชำระเงิน" }, { status: 400 });
    }

    // Verify order belongs to user
    const [order] = await db
      .select()
      .from(orders)
      .where(
        and(eq(orders.id, id), eq(orders.userId, session.userId))
      )
      .limit(1);

    if (!order) {
      return Response.json({ error: "ไม่พบคำสั่งซื้อที่ระบุหรือคุณไม่มีสิทธิ์เข้าถึง" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return Response.json({ error: "ไม่สามารถอัปโหลดสลิปได้ในสถานะนี้" }, { status: 400 });
    }

    await db
      .update(orders)
      .set({
        paymentSlipImage: base64Image,
        status: "paid",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id));

    return Response.json({ success: true, message: "อัปโหลดสลิปการชำระเงินเรียบร้อยแล้ว" });
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการอัปโหลดสลิป" }, { status: 500 });
  }
}
