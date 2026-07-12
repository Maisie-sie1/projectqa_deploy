import { db } from "@/lib/db";
import { books, orders, users } from "@/lib/db/schema";
import { count, sum, eq } from "drizzle-orm";
import Link from "next/link";

export default async function AdminDashboard() {
  const [{ totalBooks }] = await db
    .select({ totalBooks: count() })
    .from(books);

  const [{ totalOrders }] = await db
    .select({ totalOrders: count() })
    .from(orders);

  const [{ pendingPayments }] = await db
    .select({ pendingPayments: count() })
    .from(orders)
    .where(eq(orders.status, "paid"));

  const [{ totalRevenue }] = await db
    .select({ totalRevenue: sum(orders.totalAmount) })
    .from(orders)
    .where(eq(orders.status, "completed"));

  const [{ totalUsers }] = await db
    .select({ totalUsers: count() })
    .from(users);

  const stats = [
    {
      label: "หนังสือทั้งหมด",
      value: totalBooks,
      icon: "menu_book",
      color: "bg-surface-container",
      href: "/admin/books",
    },
    {
      label: "คำสั่งซื้อทั้งหมด",
      value: totalOrders,
      icon: "receipt_long",
      color: "bg-surface-container",
      href: "/admin/orders",
    },
    {
      label: "รอตรวจสอบการชำระ",
      value: pendingPayments,
      icon: "pending_actions",
      color: "bg-secondary-fixed",
      href: "/admin/orders",
    },
    {
      label: "รายได้รวม",
      value: `฿${Number(totalRevenue || 0).toLocaleString()}`,
      icon: "payments",
      color: "bg-surface-container",
      href: "/admin/orders",
    },
    {
      label: "สมาชิกทั้งหมด",
      value: totalUsers,
      icon: "group",
      color: "bg-surface-container",
      href: "#",
    },
  ];

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-8">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className={`${stat.color} rounded-xl p-6 hover:shadow-md transition-shadow border border-outline-variant/20`}
          >
            <div className="flex items-center gap-4">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant">
                {stat.icon}
              </span>
              <div>
                <p className="text-sm text-on-surface-variant">{stat.label}</p>
                <p className="font-serif text-2xl font-bold text-on-surface mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
