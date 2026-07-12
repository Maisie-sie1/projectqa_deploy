import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { logout } from "@/app/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-container text-on-primary-container flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-on-primary-container/10">
          <Link href="/" className="font-serif text-xl font-bold text-on-primary">
            Lumina Books
          </Link>
          <p className="text-xs text-on-primary-container mt-1">แผงควบคุม Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-on-primary-container/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">dashboard</span>
            <span className="text-sm font-semibold">Dashboard</span>
          </Link>
          <Link
            href="/admin/books"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-on-primary-container/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">menu_book</span>
            <span className="text-sm font-semibold">จัดการหนังสือ</span>
          </Link>
          <Link
            href="/admin/orders"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-on-primary-container/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">receipt_long</span>
            <span className="text-sm font-semibold">จัดการคำสั่งซื้อ</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-on-primary-container/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-on-primary-container/10 transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-xl">storefront</span>
            กลับไปหน้าร้าน
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-error/10 transition-colors text-sm text-error"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              ออกจากระบบ
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 bg-background overflow-auto">
        {/* Mobile header */}
        <div className="md:hidden bg-primary-container text-on-primary-container p-4 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg font-bold">
            Lumina Admin
          </Link>
          <div className="flex gap-2">
            <Link href="/admin" className="p-2">
              <span className="material-symbols-outlined text-xl">dashboard</span>
            </Link>
            <Link href="/admin/books" className="p-2">
              <span className="material-symbols-outlined text-xl">menu_book</span>
            </Link>
            <Link href="/admin/orders" className="p-2">
              <span className="material-symbols-outlined text-xl">receipt_long</span>
            </Link>
          </div>
        </div>

        <div className="p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}
