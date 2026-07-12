"use server";

import { db } from "@/lib/db";
import { cartItems, books } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addToCart(bookId: number, quantity: number = 1) {
  const session = await requireAuth();

  // Check if already in cart
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
    await db
      .update(cartItems)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      userId: session.userId,
      bookId,
      quantity,
    });
  }

  revalidatePath("/cart");
  revalidatePath("/");
}

export async function updateCartItem(cartItemId: number, quantity: number) {
  const session = await requireAuth();

  if (quantity <= 0) {
    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.id, cartItemId),
          eq(cartItems.userId, session.userId)
        )
      );
  } else {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.id, cartItemId),
          eq(cartItems.userId, session.userId)
        )
      );
  }

  revalidatePath("/cart");
}

export async function removeFromCart(cartItemId: number) {
  const session = await requireAuth();

  await db
    .delete(cartItems)
    .where(
      and(
        eq(cartItems.id, cartItemId),
        eq(cartItems.userId, session.userId)
      )
    );

  revalidatePath("/cart");
}

export async function clearCart() {
  const session = await requireAuth();

  await db
    .delete(cartItems)
    .where(eq(cartItems.userId, session.userId));

  revalidatePath("/cart");
}

export async function getCartItems() {
  const session = await requireAuth();

  const items = await db.query.cartItems.findMany({
    where: eq(cartItems.userId, session.userId),
    with: {
      book: true,
    },
  });

  return items;
}

export async function getCartCount() {
  const session = await requireAuth();

  const items = await db
    .select({ quantity: cartItems.quantity })
    .from(cartItems)
    .where(eq(cartItems.userId, session.userId));

  return items.reduce((sum, item) => sum + item.quantity, 0);
}
