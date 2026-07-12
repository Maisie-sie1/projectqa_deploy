"use server";

import { db } from "@/lib/db";
import { books, orders, categories } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { bookSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type BookFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createBook(
  _prevState: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  await requireAdmin();

  const raw = {
    title: formData.get("title") as string,
    author: formData.get("author") as string,
    description: formData.get("description") as string,
    price: formData.get("price") as string,
    originalPrice: formData.get("originalPrice") as string,
    categoryId: formData.get("categoryId") as string,
    stock: formData.get("stock") as string,
    isBestSeller: formData.get("isBestSeller") === "on",
  };

  const result = bookSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const coverImage = formData.get("coverImage") as string;

  await db.insert(books).values({
    ...result.data,
    originalPrice: result.data.originalPrice
      ? Number(result.data.originalPrice)
      : null,
    coverImage: coverImage || null,
  });

  revalidatePath("/admin/books");
  revalidatePath("/");
  revalidatePath("/books");
  redirect("/admin/books");
}

export async function updateBook(
  bookId: number,
  _prevState: BookFormState,
  formData: FormData
): Promise<BookFormState> {
  await requireAdmin();

  const raw = {
    title: formData.get("title") as string,
    author: formData.get("author") as string,
    description: formData.get("description") as string,
    price: formData.get("price") as string,
    originalPrice: formData.get("originalPrice") as string,
    categoryId: formData.get("categoryId") as string,
    stock: formData.get("stock") as string,
    isBestSeller: formData.get("isBestSeller") === "on",
  };

  const result = bookSchema.safeParse(raw);
  if (!result.success) {
    return { fieldErrors: result.error.flatten().fieldErrors };
  }

  const coverImage = formData.get("coverImage") as string;

  const updateData: Record<string, unknown> = {
    ...result.data,
    originalPrice: result.data.originalPrice
      ? Number(result.data.originalPrice)
      : null,
  };

  if (coverImage) {
    updateData.coverImage = coverImage;
  }

  await db.update(books).set(updateData).where(eq(books.id, bookId));

  revalidatePath("/admin/books");
  revalidatePath("/");
  revalidatePath("/books");
  revalidatePath(`/books/${bookId}`);
  redirect("/admin/books");
}

export async function deleteBook(bookId: number) {
  await requireAdmin();

  await db.delete(books).where(eq(books.id, bookId));

  revalidatePath("/admin/books");
  revalidatePath("/");
  revalidatePath("/books");
}

export async function confirmPayment(orderId: number) {
  await requireAdmin();

  await db
    .update(orders)
    .set({ status: "confirmed", updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/orders");
}

export async function rejectPayment(orderId: number) {
  await requireAdmin();

  await db
    .update(orders)
    .set({ status: "pending", paymentSlipImage: null, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/orders");
}

export async function updateOrderStatus(
  orderId: number,
  status: "pending" | "paid" | "confirmed" | "shipped" | "completed" | "cancelled"
) {
  await requireAdmin();

  await db
    .update(orders)
    .set({ status, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/orders");
}
