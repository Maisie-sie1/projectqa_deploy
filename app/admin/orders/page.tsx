import { db } from "@/lib/db";
import { orders, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import AdminOrderActions from "./AdminOrderActions";

const statusLabels: Record<string, string> = {
  pending: "รอชำระเงิน",
  paid: "รอตรวจสอบ",
  confirmed: "ยืนยันแล้ว",
  shipped: "กำลังจัดส่ง",
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
};

export default async function AdminOrdersPage() {
  const orderList = await db.query.orders.findMany({
    with: { user: true },
    orderBy: [desc(orders.createdAt)],
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-8">
        จัดการคำสั่งซื้อ
      </h1>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container">
                <th className="text-left px-4 py-3 font-semibold tracking-wide text-on-surface-variant">
                  #
                </th>
                <th className="text-left px-4 py-3 font-semibold tracking-wide text-on-surface-variant">
                  ลูกค้า
                </th>
                <th className="text-right px-4 py-3 font-semibold tracking-wide text-on-surface-variant">
                  ยอดรวม
                </th>
                <th className="text-center px-4 py-3 font-semibold tracking-wide text-on-surface-variant">
                  สถานะ
                </th>
                <th className="text-center px-4 py-3 font-semibold tracking-wide text-on-surface-variant">
                  สลิป
                </th>
                <th className="text-left px-4 py-3 font-semibold tracking-wide text-on-surface-variant hidden md:table-cell">
                  วันที่
                </th>
                <th className="text-right px-4 py-3 font-semibold tracking-wide text-on-surface-variant">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {orderList.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-4 py-3 text-on-surface font-semibold">
                    {order.id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-on-surface font-semibold">
                      {order.user.name}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {order.user.email}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right text-on-surface font-semibold">
                    ฿{order.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`status-${order.status} px-3 py-1 rounded-full text-xs font-semibold tracking-wide inline-block`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {order.paymentSlipImage ? (
                      <span className="material-symbols-outlined text-success text-lg">
                        check_circle
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-outline-variant text-lg">
                        cancel
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">
                    {new Date(order.createdAt).toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-2 hover:bg-surface-container rounded transition-colors text-on-surface-variant hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-lg">
                          visibility
                        </span>
                      </Link>
                      {order.status === "paid" && (
                        <AdminOrderActions orderId={order.id} />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orderList.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2">
              receipt_long
            </span>
            <p>ยังไม่มีคำสั่งซื้อ</p>
          </div>
        )}
      </div>
    </div>
  );
}
