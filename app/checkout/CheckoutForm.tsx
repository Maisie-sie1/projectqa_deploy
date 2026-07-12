"use client";

import { useActionState } from "react";
import { createOrder, type OrderState } from "@/app/actions/order";

export default function CheckoutForm() {
  const [state, formAction, isPending] = useActionState<OrderState, FormData>(
    createOrder,
    {}
  );

  return (
    <form action={formAction} className="space-y-12">
      {/* Shipping Address */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/40 pb-4">
          <span className="material-symbols-outlined text-primary text-[28px]">
            local_shipping
          </span>
          <h2 className="font-serif text-2xl font-semibold text-primary">
            ที่อยู่สำหรับจัดส่ง
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
          {state.error && (
            <div className="col-span-1 md:col-span-2 bg-error-container text-on-error-container px-4 py-3 rounded-sm text-sm">
              {state.error}
            </div>
          )}

          <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-on-surface-variant" htmlFor="email">
              อีเมลสำหรับติดต่อ
            </label>
            <input
              className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary placeholder-outline-variant/60"
              id="email"
              name="email"
              placeholder="your@email.com"
              type="email"
              required
            />
            <span className="text-[11px] text-on-surface-variant/60">ใช้อีเมลนี้เพื่อตรวจสอบสถานะของคำสั่งซื้อ</span>
            {state.fieldErrors?.email && (
              <p className="text-error text-xs">{state.fieldErrors.email[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-on-surface-variant" htmlFor="firstName">
              ชื่อ
            </label>
            <input
              className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              id="firstName"
              name="firstName"
              type="text"
              required
            />
            {state.fieldErrors?.firstName && (
              <p className="text-error text-xs">{state.fieldErrors.firstName[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-on-surface-variant" htmlFor="lastName">
              นามสกุล
            </label>
            <input
              className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              id="lastName"
              name="lastName"
              type="text"
              required
            />
            {state.fieldErrors?.lastName && (
              <p className="text-error text-xs">{state.fieldErrors.lastName[0]}</p>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-on-surface-variant" htmlFor="address">
              ที่อยู่ (บ้านเลขที่, ซอย, ถนน)
            </label>
            <input
              className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              id="address"
              name="address"
              type="text"
              required
            />
            {state.fieldErrors?.address && (
              <p className="text-error text-xs">{state.fieldErrors.address[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-on-surface-variant" htmlFor="city">
              เขต/อำเภอ
            </label>
            <input
              className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              id="city"
              name="city"
              type="text"
              required
            />
            {state.fieldErrors?.city && (
              <p className="text-error text-xs">{state.fieldErrors.city[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-on-surface-variant" htmlFor="province">
              จังหวัด
            </label>
            <select
              className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              id="province"
              name="province"
              required
            >
              <option value="">เลือกจังหวัด</option>
              <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
              <option value="เชียงใหม่">เชียงใหม่</option>
              <option value="ภูเก็ต">ภูเก็ต</option>
              <option value="ขอนแก่น">ขอนแก่น</option>
              <option value="นครราชสีมา">นครราชสีมา</option>
              <option value="สงขลา">สงขลา</option>
              <option value="ชลบุรี">ชลบุรี</option>
              <option value="เชียงราย">เชียงราย</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
            {state.fieldErrors?.province && (
              <p className="text-error text-xs">{state.fieldErrors.province[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-on-surface-variant" htmlFor="postalCode">
              รหัสไปรษณีย์
            </label>
            <input
              className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              id="postalCode"
              name="postalCode"
              placeholder="10400"
              type="text"
              pattern="[0-9]{5}"
              title="รหัสไปรษณีย์ 5 หลัก เช่น 10400"
              minLength={5}
              maxLength={5}
              required
            />
            <span className="text-[11px] text-on-surface-variant/60">ตัวเลข 5 หลัก เช่น 10400</span>
            {state.fieldErrors?.postalCode && (
              <p className="text-error text-xs">{state.fieldErrors.postalCode[0]}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide text-on-surface-variant" htmlFor="phone">
              เบอร์โทรศัพท์
            </label>
            <input
              className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
              id="phone"
              name="phone"
              placeholder="0812345678"
              type="tel"
              pattern="[0-9]{9,10}"
              title="เบอร์โทรศัพท์ 9-10 หลัก เช่น 0812345678"
              minLength={9}
              maxLength={10}
              required
            />
            <span className="text-[11px] text-on-surface-variant/60">ตัวเลข 9-10 หลัก เช่น 0812345678</span>
            {state.fieldErrors?.phone && (
              <p className="text-error text-xs">{state.fieldErrors.phone[0]}</p>
            )}
          </div>
        </div>
      </section>

      {/* Payment Method */}
      <section>
        <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/40 pb-4">
          <span className="material-symbols-outlined text-primary text-[28px]">
            account_balance
          </span>
          <h2 className="font-serif text-2xl font-semibold text-primary">
            วิธีการชำระเงิน
          </h2>
        </div>

        <div className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/30">
          <h3 className="text-sm font-semibold tracking-wide text-on-surface mb-4">
            โอนเงินผ่านธนาคาร
          </h3>
          <div className="space-y-3 text-sm text-on-surface-variant">
            <div className="flex items-center gap-3 p-3 bg-surface rounded-sm border border-outline-variant/20">
              <span className="material-symbols-outlined text-secondary">
                account_balance
              </span>
              <div>
                <p className="font-semibold text-on-surface">ธนาคารกสิกรไทย</p>
                <p>เลขบัญชี: 123-4-56789-0</p>
                <p>ชื่อ: บริษัท ลูมิน่า บุ๊คส์ จำกัด</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface rounded-sm border border-outline-variant/20">
              <span className="material-symbols-outlined text-info">
                qr_code_scanner
              </span>
              <div>
                <p className="font-semibold text-on-surface">พร้อมเพย์ (PromptPay)</p>
                <p>หมายเลข: 099-999-9999</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-4">
            * หลังโอนเงินแล้ว คุณสามารถอัปโหลดสลิปได้ในหน้ารายละเอียดคำสั่งซื้อ
          </p>
        </div>
      </section>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-on-primary py-4 rounded-sm text-sm font-semibold tracking-wide hover:bg-inverse-surface transition-colors duration-200 shadow-sm flex justify-center items-center gap-2 group disabled:opacity-50 cursor-pointer"
      >
        {isPending ? "กำลังสร้างคำสั่งซื้อ..." : "ยืนยันคำสั่งซื้อ"}
        <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
          lock
        </span>
      </button>
    </form>
  );
}
