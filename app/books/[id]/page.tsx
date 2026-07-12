import { db } from "@/lib/db";
import { books, categories } from "@/lib/db/schema";
import { eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import StarRating from "@/app/components/StarRating";
import AddToCartButton from "@/app/components/AddToCartButton";
import BookCard from "@/app/components/BookCard";
import Link from "next/link";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bookId = Number(id);

  const book = await db.query.books.findFirst({
    where: eq(books.id, bookId),
    with: { category: true },
  });

  if (!book) notFound();

  // Related books from same category
  const related = book.categoryId
    ? await db
        .select()
        .from(books)
        .where(
          ne(books.id, book.id)
        )
        .limit(4)
    : [];

  return (
    <>
      <Navbar />
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16 flex-grow">
        {/* Product Details */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 md:mb-24 items-start">
          {/* Book Cover Container */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-full max-w-md">
              <div className="absolute inset-0 bg-secondary/5 rounded-xl blur-xl group-hover:bg-secondary/10 transition-all duration-500 scale-95" />
              <div className="relative bg-surface-container-lowest p-8 md:p-12 rounded-xl flex justify-center aspect-[3/4] items-center border border-outline-variant/30 z-10 transition-transform duration-300 hover:scale-[1.01] hover:shadow-md">
                {book.coverImage ? (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-contain book-shadow"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant">
                    <span className="material-symbols-outlined text-7xl">
                      menu_book
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Book Info */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Breadcrumb */}
            <nav className="flex text-on-surface-variant/80 text-xs font-bold tracking-widest uppercase mb-6">
              <ol className="inline-flex items-center space-x-2">
                <li>
                  <Link href="/" className="hover:text-secondary transition-colors">
                    หน้าแรก
                  </Link>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xs">chevron_right</span>
                  <Link href="/books" className="hover:text-secondary transition-colors">
                    หนังสือ
                  </Link>
                </li>
                {book.category && (
                  <li className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <Link
                      href={`/books?category=${book.category.slug}`}
                      className="hover:text-secondary transition-colors text-secondary"
                    >
                      {book.category.name}
                    </Link>
                  </li>
                )}
              </ol>
            </nav>

            <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-on-surface leading-tight mb-2">
              {book.title}
            </h1>
            <h2 className="text-base font-semibold tracking-wide text-on-surface-variant/80 mb-6">
              เขียนโดย <span className="text-secondary font-bold">{book.author}</span>
            </h2>

            {/* Rating */}
            {book.rating !== null && book.rating !== undefined && book.rating > 0 && (
              <div className="flex items-center gap-2 mb-6 bg-surface-container-low/40 w-fit px-3 py-1.5 rounded-sm border border-outline-variant/10">
                <StarRating rating={book.rating} size="text-[16px]" />
                <span className="text-xs font-bold text-on-surface-variant">
                  {book.rating.toFixed(1)} / 5.0 ({book.reviewCount || 0} รีวิว)
                </span>
              </div>
            )}

            {/* Tags */}
            <div className="flex gap-2 mb-6">
              {book.category && (
                <span className="px-3 py-1 bg-surface-container-low text-on-surface-variant border border-outline-variant/20 rounded-full text-xs font-bold tracking-wider uppercase">
                  {book.category.name}
                </span>
              )}
              {book.isBestSeller && (
                <span className="px-3 py-1 bg-secondary/15 text-secondary border border-secondary/20 rounded-full text-xs font-bold tracking-wider uppercase">
                  Best Seller
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-base text-on-surface-variant leading-relaxed mb-8 max-w-xl">
              {book.description || "ยังไม่มีข้อมูลคำแนะนำหนังสือเล่มนี้ ร่วมสัมผัสความสุนทรีย์ของเนื้อหาการเรียนรู้ผ่านหนังสือพรีเมียมจากคลังหนังสือของเรา"}
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8 border-t border-outline-variant/30 pt-6">
              <span className="font-serif text-3xl font-bold text-secondary">
                ฿{book.price.toLocaleString()}
              </span>
              {book.originalPrice && book.originalPrice > book.price && (
                <span className="text-base text-outline line-through">
                  ฿{book.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="sm:w-64">
                <AddToCartButton bookId={book.id} variant="full" />
              </div>
              <button className="bg-transparent hover:bg-surface-container-low text-on-surface text-sm font-bold tracking-wider py-4 px-6 rounded-sm transition-all border border-outline-variant hover:border-primary flex items-center justify-center gap-2 cursor-pointer shadow-xs">
                <span className="material-symbols-outlined text-lg">
                  favorite
                </span>
                บันทึกไว้ในรายการโปรด
              </button>
            </div>

            {/* Shipping info */}
            <div className="mt-8 pt-6 border-t border-outline-variant/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold tracking-wide text-on-surface-variant/80">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">
                  local_shipping
                </span>
                <span>ส่งฟรีเมื่อช้อปครบ ฿1,000</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">
                  verified_user
                </span>
                <span>ลิขสิทธิ์แท้ 100%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">
                  inventory
                </span>
                <span>
                  สต็อก: {book.stock > 0 ? `${book.stock} เล่ม` : "สินค้าหมดชั่วคราว"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Related Books */}
        {related.length > 0 && (
          <section>
            <div className="flex justify-between items-end mb-8 border-b border-outline-variant/30 pb-4">
              <h3 className="font-serif text-2xl font-semibold text-on-surface">
                หนังสือที่คุณอาจสนใจ
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-gutter">
              {related.map((relBook) => (
                <BookCard key={relBook.id} book={relBook} showCartButton={false} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
