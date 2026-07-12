import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import CheckoutForm from "./CheckoutForm";

export default async function CheckoutPage() {
  const session = await requireAuth();

  const items = await db.query.cartItems.findMany({
    where: eq(cartItems.userId, session.userId),
    with: { book: true },
  });

  if (items.length === 0) {
    redirect("/cart");
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.book.price * item.quantity,
    0
  );
  const shippingFee = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + shippingFee;

  return (
    <>
      <Navbar />
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-primary mb-8 md:mb-12">
          ชำระเงิน
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left: Form */}
          <div className="lg:col-span-7 xl:col-span-8">
            <CheckoutForm />
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5 xl:col-span-4 mt-8 lg:mt-0">
            <div className="sticky top-24 bg-surface-container-low rounded-lg p-6 md:p-8 flex flex-col gap-6">
              <h2 className="font-serif text-xl font-bold text-on-surface border-b border-outline-variant/30 pb-4">
                สรุปคำสั่งซื้อ
              </h2>

              {/* Order Items */}
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start pb-4 border-b border-outline-variant/10">
                    <div className="w-16 h-20 bg-surface-container-lowest p-2 rounded-lg border border-outline-variant/20 flex-shrink-0 flex items-center justify-center">
                      {item.book.coverImage ? (
                        <img
                          src={item.book.coverImage}
                          alt={item.book.title}
                          className="w-full h-full object-contain book-shadow"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant/40">
                            menu_book
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow flex flex-col min-w-0">
                      <span className="font-serif text-sm font-semibold text-on-surface line-clamp-1">
                        {item.book.title}
                      </span>
                      <span className="text-xs text-on-surface-variant/80 mt-0.5">
                        โดย {item.book.author}
                      </span>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-on-surface-variant">
                          จำนวน: {item.quantity}
                        </span>
                        <span className="text-sm font-bold text-secondary">
                          ฿{(item.book.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-2 text-sm text-on-surface-variant">
                <div className="flex justify-between">
                  <span>ยอดรวมสินค้า</span>
                  <span className="font-semibold text-on-surface">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าจัดส่ง</span>
                  <span className="font-semibold text-on-surface">{shippingFee === 0 ? "ฟรี" : `฿${shippingFee}`}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-outline-variant/40">
                <span className="font-serif text-lg font-bold text-on-surface">ยอดรวมสุทธิ</span>
                <span className="font-serif text-2xl font-bold text-secondary">
                  ฿{total.toLocaleString()}
                </span>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-col items-center gap-2 mt-2 text-center">
                <div className="flex gap-3 text-on-surface-variant opacity-60">
                  <span className="material-symbols-outlined text-[24px]">
                    verified_user
                  </span>
                  <span className="material-symbols-outlined text-[24px]">
                    local_shipping
                  </span>
                  <span className="material-symbols-outlined text-[24px]">
                    autorenew
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant/80 mt-2">
                  การสั่งซื้อของคุณปลอดภัย 100%
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
