"use client";

import { deleteBook } from "@/app/actions/admin";
import { useTransition } from "react";

export default function DeleteBookButton({ bookId }: { bookId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => {
        if (confirm("คุณต้องการลบหนังสือเล่มนี้ใช่หรือไม่?")) {
          startTransition(() => deleteBook(bookId));
        }
      }}
      disabled={isPending}
      className="p-2 hover:bg-error-container rounded transition-colors text-on-surface-variant hover:text-error disabled:opacity-50"
    >
      <span className="material-symbols-outlined text-lg">delete</span>
    </button>
  );
}
