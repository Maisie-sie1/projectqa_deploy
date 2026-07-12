"use client";

import { updateCartItem, removeFromCart } from "@/app/actions/cart";
import { useTransition } from "react";

interface CartItemRowProps {
  item: {
    id: number;
    quantity: number;
    book: {
      id: number;
      title: string;
      author: string;
      price: number;
      coverImage: string | null;
    };
  };
}

export default function CartItemRow({ item }: CartItemRowProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <article className="bg-surface-container-lowest rounded-xl p-4 md:p-6 shadow-xs border border-outline-variant/20 flex flex-col sm:flex-row gap-6 relative hover:shadow-md transition-all duration-300">
      {/* Book Cover */}
      <div className="w-24 md:w-32 flex-shrink-0 flex items-center justify-center">
        <div className="relative bg-surface-container-low p-3 aspect-[3/4] rounded-lg border border-outline-variant/20 w-full flex items-center justify-center">
          {item.book.coverImage ? (
            <img
              src={item.book.coverImage}
              alt={item.book.title}
              className="w-full h-full object-contain book-shadow"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl">
                menu_book
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-serif text-xl font-semibold text-on-surface leading-tight">
                {item.book.title}
              </h3>
              <p className="text-sm font-semibold tracking-wide text-on-surface-variant mt-1">
                {item.book.author}
              </p>
            </div>
            <p className="font-serif text-xl font-semibold text-on-surface">
              ฿{(item.book.price * item.quantity).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center mt-6">
          {/* Quantity Selector */}
          <div className="flex items-center border border-outline-variant rounded-md overflow-hidden bg-surface-container-lowest">
            <button
              onClick={() =>
                startTransition(() =>
                  updateCartItem(item.id, item.quantity - 1)
                )
              }
              disabled={isPending}
              className="px-3 py-1 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">remove</span>
            </button>
            <span className="w-12 text-center py-1 border-x border-outline-variant text-on-surface">
              {item.quantity}
            </span>
            <button
              onClick={() =>
                startTransition(() =>
                  updateCartItem(item.id, item.quantity + 1)
                )
              }
              disabled={isPending}
              className="px-3 py-1 text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>

          {/* Remove */}
          <button
            onClick={() =>
              startTransition(() => removeFromCart(item.id))
            }
            disabled={isPending}
            className="text-error hover:text-on-error-container text-sm font-semibold tracking-wide flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            <span>ลบ</span>
          </button>
        </div>
      </div>
    </article>
  );
}
