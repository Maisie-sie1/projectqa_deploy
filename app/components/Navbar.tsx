import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import UserDropdown from "./UserDropdown";

export default async function Navbar() {
  const user = await getCurrentUser();

  let cartCount = 0;
  if (user) {
    const session = await getSession();
    if (session) {
      const items = await db
        .select({ quantity: cartItems.quantity })
        .from(cartItems)
        .where(eq(cartItems.userId, session.userId));
      cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    }
  }

  return (
    <header className="bg-surface border-b border-outline-variant sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-unit max-w-container-max mx-auto">
        <Link
          href="/"
          className="font-serif text-2xl font-bold text-primary hover:text-secondary transition-colors duration-200"
        >
          Lumina Books
        </Link>

        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/books"
            className="text-on-surface-variant hover:text-secondary transition-colors duration-200"
            aria-label="ค้นหา"
          >
            <span className="material-symbols-outlined">search</span>
          </Link>

          {user ? (
            <>
              <Link
                href="/cart"
                className="text-on-surface-variant hover:text-secondary transition-colors duration-200 relative"
                aria-label="ตะกร้า"
              >
                <span className="material-symbols-outlined">
                  shopping_cart
                </span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-secondary text-on-secondary text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <UserDropdown user={user} />
            </>
          ) : (
            <Link
              href="/login"
              className="text-on-surface-variant hover:text-secondary transition-colors duration-200"
              aria-label="เข้าสู่ระบบ"
            >
              <span className="material-symbols-outlined">person</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
