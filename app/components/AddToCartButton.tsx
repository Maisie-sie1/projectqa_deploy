"use client";

import { addToCart } from "@/app/actions/cart";
import { useTransition } from "react";

interface AddToCartButtonProps {
  bookId: number;
  variant?: "overlay" | "full" | "icon";
}

export default function AddToCartButton({
  bookId,
  variant = "full",
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        await addToCart(bookId, 1);
      } catch {
        // Redirect to login handled by requireAuth
      }
    });
  }

  if (variant === "overlay") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className="bg-surface text-on-surface text-sm font-semibold tracking-wide px-6 py-2 rounded-full shadow-sm hover:bg-primary hover:text-on-primary transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-[18px]">
          shopping_cart
        </span>
        {isPending ? "กำลังเพิ่ม..." : "หยิบใส่ตะกร้า"}
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        className="bg-primary text-on-primary p-2 rounded-lg hover:bg-inverse-surface transition-colors disabled:opacity-50"
        aria-label="เพิ่มลงตะกร้า"
      >
        <span className="material-symbols-outlined text-lg">
          {isPending ? "hourglass_empty" : "shopping_bag"}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex-1 bg-primary hover:bg-inverse-surface text-on-primary text-sm font-semibold tracking-wide py-3 px-6 rounded-sm transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-lg">shopping_bag</span>
      {isPending ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
    </button>
  );
}
