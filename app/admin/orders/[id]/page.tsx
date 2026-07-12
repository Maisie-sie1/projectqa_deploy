import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import AdminOrderActions from "../AdminOrderActions";
import OrderStatusUpdate from "./OrderStatusUpdate";

const statusLabels: Record<string, string> = {
  pending: "รอชำระเงิน",
  paid: "รอตรวจสอบ",
  confirmed: "ยืนยันแล้ว",
  shipped: "กำลังจัดส่ง",
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, Number(id)),
    with: {
      user: true,
      items: { with: { book: true } },
    },
  });

  if (!order) notFound();

  const address = order.shippingAddress as Record<string, string> | null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/orders"
          className="p-2 hover:bg-surface-container rounded transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <h1 className="font-serif text-3xl font-bold text-on-surface">
          คำสั่งซื้อ #{order.id}
        </h1>
        <span
          className={`status-${order.status} px-3 py-1 rounded-full text-xs font-semibold tracking-wide`}
        >
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Order Info */}
        <div className="space-y-8">
          {/* Customer */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
            <h2 className="text-sm font-semibold tracking-wide text-on-surface-variant uppercase mb-4">
              ข้อมูลลูกค้า
            </h2>
            <p className="font-semibold text-on-surface">{order.user.name}</p>
            <p className="text-sm text-on-surface-variant">{order.user.email}</p>
          </div>

          {/* Address */}
          {address && (
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
              <h2 className="text-sm font-semibold tracking-wide text-on-surface-variant uppercase mb-4">
                ที่อยู่จัดส่ง
              </h2>
              <div className="text-sm text-on-surface-variant space-y-1">
                <p className="font-semibold text-on-surface">
                  {address.firstName} {address.lastName}
                </p>
                <p>{address.address}</p>
                <p>
                  {address.city}, {address.province} {address.postalCode}
                </p>
                <p>{address.phone}</p>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
            <h2 className="text-sm font-semibold tracking-wide text-on-surface-variant uppercase mb-4">
              รายการสินค้า
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-14 bg-surface-container rounded overflow-hidden flex-shrink-0">
                      {item.book.coverImage ? (
                        <img
                          src={item.book.coverImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-xs text-on-surface-variant">
                            menu_book
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {item.book.title}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        x{item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-on-surface">
                    ฿{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between">
              <span className="font-semibold text-on-surface">ยอดรวม</span>
              <span className="font-serif text-xl font-bold text-on-surface">
                ฿{order.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Payment & Actions */}
        <div className="space-y-8">
          {/* Payment Slip */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
            <h2 className="text-sm font-semibold tracking-wide text-on-surface-variant uppercase mb-4">
              สลิปการชำระเงิน
            </h2>
            {order.paymentSlipImage ? (
              <img
                src={order.paymentSlipImage}
                alt="สลิป"
                className="max-w-full max-h-96 rounded border border-outline-variant mx-auto"
              />
            ) : (
              <p className="text-sm text-on-surface-variant text-center py-8">
                ยังไม่มีสลิปการชำระเงิน
              </p>
            )}

            {order.status === "paid" && (
              <div className="mt-4 flex gap-4 justify-center">
                <AdminOrderActions orderId={order.id} />
              </div>
            )}
          </div>

          {/* Status Update */}
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant">
            <h2 className="text-sm font-semibold tracking-wide text-on-surface-variant uppercase mb-4">
              อัปเดตสถานะ
            </h2>
            <OrderStatusUpdate
              orderId={order.id}
              currentStatus={order.status}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
