"use client";

import { useActionState } from "react";
import { signup, type AuthState } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signup,
    {}
  );

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background">
      {/* Column 1: Aesthetic Branding Sidebar (Left) */}
      <div className="hidden lg:flex lg:col-span-6 relative flex-col justify-between p-12 text-on-primary bg-primary overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-10000 hover:scale-100"
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1000')" 
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent z-10" />

        {/* Header Branding */}
        <div className="relative z-20">
          <Link href="/" className="font-serif text-3xl font-extrabold tracking-tight text-white">
            Lumina Books
          </Link>
          <p className="text-xs text-secondary font-bold tracking-widest uppercase mt-1">
            The Joy of Reading
          </p>
        </div>

        {/* Editorial Quote */}
        <div className="relative z-20 my-auto pr-6">
          <span className="material-symbols-outlined text-secondary text-5xl mb-4 select-none">
            format_quote
          </span>
          <blockquote className="font-serif text-2xl italic leading-relaxed font-light mb-6 text-slate-100">
            "หนังสือคือกระจกส่องใจที่ช่วยให้เรามองเห็นจิตวิญญาณและความคิดของผู้เขียน รวมถึงค้นพบตัวตนของเราเอง"
          </blockquote>
          <cite className="text-sm font-semibold tracking-wide text-secondary not-italic">
            — ทีมงาน Lumina
          </cite>
        </div>

        {/* Footer info */}
        <div className="relative z-20 text-xs text-on-primary/60">
          © {new Date().getFullYear()} Lumina Books. All rights reserved.
        </div>
      </div>

      {/* Column 2: Signup Form (Right) */}
      <div className="col-span-1 lg:col-span-6 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-lg">
          {/* Mobile-only Branding */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="font-serif text-3xl font-bold text-primary">
              Lumina Books
            </Link>
            <p className="text-on-surface-variant text-sm mt-1">
              สร้างบัญชีเพื่อเริ่มต้นการช้อปปิ้ง
            </p>
          </div>

          <div className="bg-surface-container-lowest rounded-xl p-8 md:p-12 shadow-sm border border-outline-variant/30">
            <button
              onClick={() => router.back()}
              type="button"
              className="flex items-center gap-1.5 text-sm font-semibold text-secondary hover:text-primary transition-colors cursor-pointer mb-6"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              ย้อนกลับ
            </button>
            <div className="mb-8">
              <h1 className="font-serif text-3xl font-bold text-on-surface">
                สมัครสมาชิกใหม่
              </h1>
              <p className="text-on-surface-variant text-sm mt-2">
                เริ่มต้นบันทึกคลังหนังสือและคำสั่งซื้อของคุณในไม่กี่ขั้นตอน
              </p>
            </div>

            {state.error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-sm text-sm mb-6">
                {state.error}
              </div>
            )}

            <form action={formAction} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
                  />
                  {state.fieldErrors?.name && (
                    <p className="text-error text-xs">{state.fieldErrors.name[0]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    อีเมล
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
                    placeholder="your@email.com"
                  />
                  {state.fieldErrors?.email && (
                    <p className="text-error text-xs">{state.fieldErrors.email[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    รหัสผ่าน
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
                  />
                  {state.fieldErrors?.password && (
                    <p className="text-error text-xs">{state.fieldErrors.password[0]}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    ยืนยันรหัสผ่าน
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full border border-outline-variant rounded-sm bg-surface px-4 py-3 text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors"
                  />
                  {state.fieldErrors?.confirmPassword && (
                    <p className="text-error text-xs">{state.fieldErrors.confirmPassword[0]}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-primary text-on-primary py-4 rounded-sm text-sm font-bold tracking-wider hover:bg-inverse-surface transition-all duration-300 disabled:opacity-50 shadow-md cursor-pointer mt-4"
              >
                {isPending ? "กำลังสร้างบัญชี..." : "สร้างบัญชีของฉัน"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
              <p className="text-sm text-on-surface-variant">
                มีบัญชีอยู่แล้ว?{" "}
                <Link href="/login" className="text-secondary hover:text-primary font-bold transition-colors">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
