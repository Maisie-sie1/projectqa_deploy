"use client";

import { useState, useTransition } from "react";
import { uploadPaymentSlip } from "@/app/actions/order";

export default function PaymentSlipUpload({ orderId }: { orderId: number }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleUpload() {
    if (!preview) return;
    setError(null);
    startTransition(async () => {
      try {
        await uploadPaymentSlip(orderId, preview);
      } catch (err: any) {
        console.error("Upload error:", err);
        setError(err.message || "เกิดข้อผิดพลาดในการอัปโหลดสลิป กรุณาลองใหม่อีกครั้ง");
      }
    });
  }

  return (
    <div className="bg-surface-container-low rounded-lg p-6 border border-dashed border-outline-variant">
      <div className="text-center">
        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
          upload_file
        </span>
        <p className="text-sm text-on-surface-variant mb-4">
          อัปโหลดสลิปการโอนเงิน (จำกัดขนาดไฟล์ไม่เกิน 4MB)
        </p>

        {error && (
          <div className="bg-error-container text-on-error-container px-4 py-2.5 rounded-sm text-xs mb-4 text-left">
            {error}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-inverse-surface file:cursor-pointer file:transition-colors"
        />

        {preview && (
          <div className="mt-4">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-64 rounded border border-outline-variant mx-auto"
            />
            <button
              onClick={handleUpload}
              disabled={isPending}
              className="mt-4 bg-primary text-on-primary px-8 py-3 rounded-sm text-sm font-semibold tracking-wide hover:bg-inverse-surface transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isPending ? "กำลังอัปโหลด..." : "ยืนยันอัปโหลดสลิป"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
