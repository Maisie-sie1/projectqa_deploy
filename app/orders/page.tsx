import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Link from "next/link";

const statusLabels: Record<string, string> = {
  pending: "รอชำระเงิน",
  paid: "รอตรวจสอบ",
  confirmed: "ยืนยันแล้ว",
  shipped: "กำลังจัดส่ง",
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
};

export default async function OrdersPage() {
  const session = await requireAuth();

  const orderList = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.userId))
    .orderBy(desc(orders.createdAt));

  return (
    <>
      <Navbar />
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16">
        <h1 className="font-serif text-3xl font-semibold text-on-surface mb-8">
          คำสั่งซื้อของฉัน
        </h1>

        {orderList.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-7xl text-outline-variant mb-4">
              receipt_long
            </span>
            <p className="text-xl text-on-surface-variant mb-6">
              ยังไม่มีคำสั่งซื้อ
            </p>
            <Link
              href="/books"
              className="bg-primary text-on-primary px-8 py-3 rounded-sm text-sm font-semibold tracking-wide hover:bg-inverse-surface transition-colors"
            >
              เลือกซื้อหนังสือ
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orderList.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-surface-container-lowest rounded-xl p-6 border border-outline-variant hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-on-surface-variant">
                      คำสั่งซื้อ #{order.id}
                    </p>
                    <p className="font-serif text-lg font-semibold text-on-surface mt-1">
                      ฿{order.totalAmount.toLocaleString()}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {new Date(order.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`status-${order.status} px-3 py-1 rounded-full text-xs font-semibold tracking-wide`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                    <span className="material-symbols-outlined text-on-surface-variant">
                      chevron_right
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
