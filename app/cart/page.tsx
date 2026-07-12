import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import CartItemRow from "./CartItemRow";
import Link from "next/link";

export default async function CartPage() {
  const session = await requireAuth();

  const items = await db.query.cartItems.findMany({
    where: eq(cartItems.userId, session.userId),
    with: { book: true },
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + shippingFee;

  return (
    <>
      <Navbar />
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16">
        <header className="mb-12">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-on-background">
            ตะกร้าสินค้าของคุณ
          </h1>
          <p className="text-on-surface-variant mt-2">
            ตรวจสอบรายการหนังสือที่คุณเลือกไว้ก่อนดำเนินการชำระเงิน
          </p>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-7xl text-outline-variant mb-4">
              shopping_cart
            </span>
            <p className="text-xl text-on-surface-variant mb-6">
              ตะกร้าสินค้าว่าง
            </p>
            <Link
              href="/books"
              className="bg-primary text-on-primary px-8 py-3 rounded-sm text-sm font-semibold tracking-wide hover:bg-inverse-surface transition-colors"
            >
              เลือกซื้อหนังสือ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            {/* Cart Items */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-4">
              <div className="bg-surface-container-low/50 rounded-xl p-6 md:p-8 sticky top-24 border border-outline-variant/30 shadow-xs">
                <h2 className="font-serif text-2xl font-bold text-on-surface mb-6 border-b border-outline-variant/30 pb-4">
                  สรุปคำสั่งซื้อ
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center text-sm text-on-surface-variant">
                    <span>ยอดรวมสินค้า ({totalItems} เล่ม)</span>
                    <span className="font-bold text-on-surface">฿{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-on-surface-variant">
                    <span>ค่าจัดส่ง</span>
                    <span className="font-bold text-on-surface">{shippingFee === 0 ? "ฟรี" : `฿${shippingFee}`}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-4 border-t border-outline-variant/40 mb-6">
                  <span className="font-serif text-lg font-semibold text-on-surface">
                    ยอดรวมสุทธิ
                  </span>
                  <span className="font-serif text-2xl font-bold text-secondary">
                    ฿{total.toLocaleString()}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-primary text-on-primary py-4 rounded-sm text-sm font-bold tracking-wider hover:bg-inverse-surface shadow-xs transition-all duration-300 flex justify-center items-center gap-2 cursor-pointer"
                >
                  <span>ดำเนินการชำระเงิน</span>
                  <span className="material-symbols-outlined text-[18px]">
                    arrow_forward
                  </span>
                </Link>
                
                <div className="mt-4 text-center">
                  <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${subtotal >= 1000 ? "bg-green-50 text-green-700 border border-green-200" : "bg-secondary/10 text-secondary border border-secondary/20"}`}>
                    {subtotal < 1000
                      ? `ช้อปอีก ฿${(1000 - subtotal).toLocaleString()} เพื่อรับจัดส่งฟรี!`
                      : "✓ สั่งซื้อบิลนี้จัดส่งฟรี"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
