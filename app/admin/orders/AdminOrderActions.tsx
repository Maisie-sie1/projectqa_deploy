"use client";

import { confirmPayment, rejectPayment } from "@/app/actions/admin";
import { useTransition } from "react";

export default function AdminOrderActions({ orderId }: { orderId: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-1">
      <button
        onClick={() => startTransition(() => confirmPayment(orderId))}
        disabled={isPending}
        className="p-2 hover:bg-green-50 rounded transition-colors text-success disabled:opacity-50"
        title="ยืนยันการชำระเงิน"
      >
        <span className="material-symbols-outlined text-lg">check_circle</span>
      </button>
      <button
        onClick={() => startTransition(() => rejectPayment(orderId))}
        disabled={isPending}
        className="p-2 hover:bg-red-50 rounded transition-colors text-error disabled:opacity-50"
        title="ปฏิเสธการชำระเงิน"
      >
        <span className="material-symbols-outlined text-lg">cancel</span>
      </button>
    </div>
  );
}
