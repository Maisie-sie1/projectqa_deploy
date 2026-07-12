import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import PaymentSlipUpload from "./PaymentSlipUpload";

const statusLabels: Record<string, string> = {
  pending: "รอชำระเงิน",
  paid: "รอตรวจสอบ",
  confirmed: "ยืนยันแล้ว",
  shipped: "กำลังจัดส่ง",
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
};

const statusSteps = ["pending", "paid", "confirmed", "shipped", "completed"];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAuth();

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, Number(id)), eq(orders.userId, session.userId)),
    with: {
      items: {
        with: { book: true },
      },
    },
  });

  if (!order) notFound();

  const currentStepIndex = statusSteps.indexOf(order.status);
  const address = order.shippingAddress as Record<string, string> | null;

  return (
    <>
      <Navbar />
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="font-serif text-3xl font-semibold text-on-surface">
            คำสั่งซื้อ #{order.id}
          </h1>
          <span
            className={`status-${order.status} px-3 py-1 rounded-full text-xs font-semibold tracking-wide`}
          >
            {statusLabels[order.status]}
          </span>
        </div>

        {/* Status Timeline */}
        {order.status !== "cancelled" && (
          <div className="mb-12 flex items-center gap-2 overflow-x-auto pb-2">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap ${
                    i <= currentStepIndex
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {i < currentStepIndex ? "check_circle" : i === currentStepIndex ? "radio_button_checked" : "radio_button_unchecked"}
                  </span>
                  {statusLabels[step]}
                </div>
                {i < statusSteps.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ${
                      i < currentStepIndex ? "bg-primary" : "bg-outline-variant"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {/* Order Items */}
          <div>
            <h2 className="font-serif text-xl font-semibold text-on-surface mb-4 border-b border-outline-variant pb-2">
              รายการสินค้า
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <div className="w-16 h-24 flex-shrink-0 rounded bg-surface-container overflow-hidden">
                    {item.book.coverImage ? (
                      <img
                        src={item.book.coverImage}
                        alt={item.book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant">
                          menu_book
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-on-surface">
                      {item.book.title}
                    </p>
                    <p className="text-sm text-on-surface-variant">
                      {item.book.author}
                    </p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-on-surface-variant">
                        จำนวน: {item.quantity}
                      </span>
                      <span className="text-sm font-semibold text-on-surface">
                        ฿{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t border-outline-variant space-y-2">
              <div className="flex justify-between text-on-surface-variant">
                <span>ค่าจัดส่ง</span>
                <span>
                  {order.shippingFee === 0 ? "ฟรี" : `฿${order.shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between font-serif text-lg font-bold text-on-surface">
                <span>ยอดรวม</span>
                <span>฿{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right: Shipping + Payment */}
          <div className="space-y-8">
            {/* Shipping Address */}
            {address && (
              <div>
                <h2 className="font-serif text-xl font-semibold text-on-surface mb-4 border-b border-outline-variant pb-2">
                  ที่อยู่จัดส่ง
                </h2>
                <div className="bg-surface-container-low rounded-lg p-4 text-sm text-on-surface-variant space-y-1">
                  <p className="font-semibold text-on-surface">
                    {address.firstName} {address.lastName}
                  </p>
                  <p>{address.address}</p>
                  <p>
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                  <p>{address.phone}</p>
                  <p>{address.email}</p>
                </div>
              </div>
            )}

            {/* Payment Slip */}
            <div>
              <h2 className="font-serif text-xl font-semibold text-on-surface mb-4 border-b border-outline-variant pb-2">
                หลักฐานการชำระเงิน
              </h2>

              {order.paymentSlipImage ? (
                <div className="bg-surface-container-low rounded-lg p-4">
                  <img
                    src={order.paymentSlipImage}
                    alt="สลิปการโอนเงิน"
                    className="max-w-full max-h-96 rounded border border-outline-variant mx-auto"
                  />
                  <p className="text-center text-sm text-on-surface-variant mt-2">
                    อัปโหลดแล้ว — รอ admin ตรวจสอบ
                  </p>
                </div>
              ) : order.status === "pending" ? (
                <PaymentSlipUpload orderId={order.id} />
              ) : (
                <p className="text-on-surface-variant text-sm">
                  ยังไม่มีหลักฐานการชำระเงิน
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
