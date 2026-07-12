"use server";

import { db } from "@/lib/db";
import { orders, orderItems, cartItems, books } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { shippingSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type OrderState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createOrder(
  _prevState: OrderState,
  formData: FormData
): Promise<OrderState> {
  const session = await requireAuth();

  // Validate shipping
  const raw = {
    email: formData.get("email") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    province: formData.get("province") as string,
    postalCode: formData.get("postalCode") as string,
    phone: formData.get("phone") as string,
  };

  const result = shippingSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  // Get cart items
  const cart = await db.query.cartItems.findMany({
    where: eq(cartItems.userId, session.userId),
    with: { book: true },
  });

  if (cart.length === 0) {
    return { error: "ตะกร้าสินค้าว่าง" };
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );
  const shippingFee = subtotal >= 1000 ? 0 : 50;
  const totalAmount = subtotal + shippingFee;

  // Create order
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

  revalidatePath("/orders");
  revalidatePath("/cart");
  redirect(`/orders/${order.id}`);
}

export async function uploadPaymentSlip(orderId: number, base64Image: string) {
  const session = await requireAuth();

  // Verify order belongs to user
  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(eq(orders.id, orderId), eq(orders.userId, session.userId))
    )
    .limit(1);

  if (!order) {
    throw new Error("ไม่พบคำสั่งซื้อ");
  }

  if (order.status !== "pending") {
    throw new Error("ไม่สามารถอัปโหลดสลิปได้ในสถานะนี้");
  }

  await db
    .update(orders)
    .set({
      paymentSlipImage: base64Image,
      status: "paid",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
}

export async function cancelOrder(orderId: number) {
  const session = await requireAuth();

  const [order] = await db
    .select()
    .from(orders)
    .where(
      and(eq(orders.id, orderId), eq(orders.userId, session.userId))
    )
    .limit(1);

  if (!order) {
    throw new Error("ไม่พบคำสั่งซื้อ");
  }

  if (!["pending", "paid"].includes(order.status)) {
    throw new Error("ไม่สามารถยกเลิกคำสั่งซื้อในสถานะนี้ได้");
  }

  await db
    .update(orders)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath(`/orders/${orderId}`);
  revalidatePath("/orders");
}
