"use client";

import { updateOrderStatus } from "@/app/actions/admin";
import { useTransition } from "react";

const statuses = [
  { value: "pending", label: "รอชำระเงิน" },
  { value: "paid", label: "รอตรวจสอบ" },
  { value: "confirmed", label: "ยืนยันแล้ว" },
  { value: "shipped", label: "กำลังจัดส่ง" },
  { value: "completed", label: "สำเร็จ" },
  { value: "cancelled", label: "ยกเลิก" },
] as const;

export default function OrderStatusUpdate({
  orderId,
  currentStatus,
}: {
  orderId: number;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2 flex-wrap">
      {statuses.map((s) => (
        <button
          key={s.value}
          onClick={() =>
            startTransition(() => updateOrderStatus(orderId, s.value))
          }
          disabled={isPending || s.value === currentStatus}
          className={`px-4 py-2 rounded-sm text-xs font-semibold tracking-wide transition-colors disabled:opacity-50 ${
            s.value === currentStatus
              ? "bg-primary text-on-primary"
              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
