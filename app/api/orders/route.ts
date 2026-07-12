import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, cartItems } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { shippingSchema } from "@/lib/validations";
import { eq, desc } from "drizzle-orm";

// 1. GET /api/orders - Get user's order history
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" }, { status: 401 });
    }

    const userOrders = await db.query.orders.findMany({
      where: eq(orders.userId, session.userId),
      orderBy: desc(orders.createdAt),
      with: {
        items: {
          with: {
            book: true,
          },
        },
      },
    });

    return Response.json(userOrders);
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ" }, { status: 500 });
  }
}

// 2. POST /api/orders - Checkout / Create an order from cart
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ error: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" }, { status: 401 });
    }

    const body = await req.json();
    const result = shippingSchema.safeParse(body);
    if (!result.success) {
      return Response.json({ fieldErrors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    // Get current cart items
    const cart = await db.query.cartItems.findMany({
      where: eq(cartItems.userId, session.userId),
      with: { book: true },
    });

    if (cart.length === 0) {
      return Response.json({ error: "ตะกร้าสินค้าว่าง ไม่สามารถสั่งซื้อได้" }, { status: 400 });
    }

    const subtotal = cart.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0
    );
    const shippingFee = subtotal >= 1000 ? 0 : 50;
    const totalAmount = subtotal + shippingFee;

    // Create order inside a transaction
    const [order] = await db
      .insert(orders)
      .values({
        userId: session.userId,
        totalAmount,
        shippingFee,
        status: "pending",
        shippingAddress: result.data,
      })
      .returning({ id: orders.id });

    // Create order items
    await db.insert(orderItems).values(
      cart.map((item) => ({
        orderId: order.id,
        bookId: item.bookId,
        quantity: item.quantity,
        price: item.book.price,
      }))
    );

    // Clear cart
    await db
      .delete(cartItems)
      .where(eq(cartItems.userId, session.userId));

    return Response.json({
      success: true,
      message: "สร้างคำสั่งซื้อสำเร็จ",
      orderId: order.id,
      totalAmount,
      shippingFee,
    });
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการสั่งซื้อสินค้า" }, { status: 500 });
  }
}
