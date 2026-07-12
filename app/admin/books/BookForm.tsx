"use client";

import { useActionState, useState } from "react";
import { createBook, updateBook, type BookFormState } from "@/app/actions/admin";

interface BookFormProps {
  categories: { id: number; name: string }[];
  book?: {
    id: number;
    title: string;
    author: string;
    description: string | null;
    price: number;
    originalPrice: number | null;
    categoryId: number | null;
    stock: number;
    isBestSeller: boolean;
    coverImage: string | null;
  };
}

export default function BookForm({ categories, book }: BookFormProps) {
  const isEdit = !!book;
  const [coverPreview, setCoverPreview] = useState<string | null>(
    book?.coverImage || null
  );
  const [coverBase64, setCoverBase64] = useState<string>("");

  const actionFn = isEdit
    ? updateBook.bind(null, book!.id)
    : createBook;

  const [state, formAction, isPending] = useActionState<BookFormState, FormData>(
    actionFn,
    {}
  );

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCoverPreview(result);
      setCoverBase64(result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {state.error && (
        <div className="bg-error-container text-on-error-container px-4 py-3 rounded-sm text-sm">
          {state.error}
        </div>
      )}

      <input type="hidden" name="coverImage" value={coverBase64} />

      {/* Cover Image */}
      <div>
        <label className="text-sm font-semibold tracking-wide text-on-surface-variant block mb-2">
          ภาพปก
        </label>
        <div className="flex items-start gap-4">
          <div className="w-32 h-48 bg-surface-container rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                  image
                </span>
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            className="text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-on-primary hover:file:bg-inverse-surface file:cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-semibold tracking-wide text-on-surface-variant">
            ชื่อหนังสือ
          </label>
          <input
            name="title"
            defaultValue={book?.title}
            required
            className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {state.fieldErrors?.title && (
            <p className="text-error text-xs">{state.fieldErrors.title[0]}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold tracking-wide text-on-surface-variant">
            ผู้แต่ง
          </label>
          <input
            name="author"
            defaultValue={book?.author}
            required
            className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold tracking-wide text-on-surface-variant">
            หมวดหมู่
          </label>
          <select
            name="categoryId"
            defaultValue={book?.categoryId || ""}
            required
            className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">เลือกหมวดหมู่</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold tracking-wide text-on-surface-variant">
            ราคา (฿)
          </label>
          <input
            name="price"
            type="number"
            step="0.01"
            defaultValue={book?.price}
            required
            className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold tracking-wide text-on-surface-variant">
            ราคาเดิม (฿) (ไม่บังคับ)
          </label>
          <input
            name="originalPrice"
            type="number"
            step="0.01"
            defaultValue={book?.originalPrice || ""}
            className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold tracking-wide text-on-surface-variant">
            จำนวนสต็อก
          </label>
          <input
            name="stock"
            type="number"
            defaultValue={book?.stock ?? 0}
            required
            className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <input
            name="isBestSeller"
            type="checkbox"
            defaultChecked={book?.isBestSeller}
            className="w-5 h-5 text-primary border-outline-variant rounded focus:ring-primary"
          />
          <label className="text-sm font-semibold tracking-wide text-on-surface-variant">
            หนังสือขายดี (Best Seller)
          </label>
        </div>

        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-semibold tracking-wide text-on-surface-variant">
            รายละเอียด
          </label>
          <textarea
            name="description"
            defaultValue={book?.description || ""}
            rows={4}
            className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-y"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-on-primary px-8 py-3 rounded-sm text-sm font-semibold tracking-wide hover:bg-inverse-surface transition-colors disabled:opacity-50"
      >
        {isPending
          ? "กำลังบันทึก..."
          : isEdit
            ? "อัปเดตหนังสือ"
            : "เพิ่มหนังสือ"}
      </button>
    </form>
  );
}
