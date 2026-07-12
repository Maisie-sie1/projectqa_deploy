import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return Response.json({ error: "ไม่มีสิทธิ์เข้าถึง (สำหรับผู้ดูแลระบบเท่านั้น)" }, { status: 403 });
    }

    const { orderId } = await params;
    const id = parseInt(orderId, 10);
    if (isNaN(id)) {
      return Response.json({ error: "รหัสคำสั่งซื้อไม่ถูกต้อง" }, { status: 400 });
    }

    const result = await db
      .update(orders)
      .set({ status: "confirmed", updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    if (result.length === 0) {
      return Response.json({ error: "ไม่พบคำสั่งซื้อที่ต้องการยืนยัน" }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: "ยืนยันสลิปการชำระเงินเรียบร้อยแล้ว",
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการยืนยันสลิปการชำระเงิน" }, { status: 500 });
  }
}
