import { db } from "@/lib/db";
import { books, categories } from "@/lib/db/schema";
import { eq, gte, lte, and, ilike, desc, asc, count } from "drizzle-orm";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import BookCard from "@/app/components/BookCard";
import Pagination from "@/app/components/Pagination";
import Link from "next/link";

const BOOKS_PER_PAGE = 9;

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const categorySlug = params.category;
  const search = params.search;
  const sort = params.sort || "newest";
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;

  // Build filters
  const conditions = [];
  if (categorySlug) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);
    if (cat) conditions.push(eq(books.categoryId, cat.id));
  }
  if (search) {
    conditions.push(ilike(books.title, `%${search}%`));
  }
  if (minPrice !== undefined) {
    conditions.push(gte(books.price, minPrice));
  }
  if (maxPrice !== undefined) {
    conditions.push(lte(books.price, maxPrice));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Sort
  const orderBy =
    sort === "price-asc"
      ? asc(books.price)
      : sort === "price-desc"
        ? desc(books.price)
        : desc(books.createdAt);

  // Count
  const [{ total }] = await db
    .select({ total: count() })
    .from(books)
    .where(whereClause);

  const totalPages = Math.ceil(total / BOOKS_PER_PAGE);

  // Fetch books
  const bookList = await db
    .select()
    .from(books)
    .where(whereClause)
    .orderBy(orderBy)
    .limit(BOOKS_PER_PAGE)
    .offset((page - 1) * BOOKS_PER_PAGE);

  // Fetch all categories for sidebar
  const allCategories = await db.select().from(categories);

  // Current category name
  const currentCategory = categorySlug
    ? allCategories.find((c) => c.slug === categorySlug)
    : null;

  return (
    <>
      <Navbar />
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-16 w-full flex-grow">
        {/* Search Header */}
        <header className="mb-10 border-b border-outline-variant/30 pb-6">
          <span className="text-xs font-bold text-secondary tracking-widest uppercase">LUMINA CATALOG</span>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold text-on-surface mt-1">
            {currentCategory ? currentCategory.name : search ? `ผลการค้นหา "${search}"` : "หนังสือทั้งหมด"}
          </h1>
          <p className="text-sm text-on-surface-variant/80 mt-2">
            พบหนังสือร่วมรายการทั้งหมด {total} เล่ม
          </p>
        </header>

        {/* Search Bar */}
        <form className="mb-12 flex gap-3 max-w-2xl">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline/80 text-xl">
              search
            </span>
            <input
              name="search"
              defaultValue={search}
              placeholder="ค้นหาตามชื่อหนังสือ, นักเขียน..."
              className="w-full pl-11 pr-4 py-3.5 border border-outline-variant rounded-sm bg-surface-container-lowest text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary transition-colors placeholder:text-outline/60"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-on-primary px-8 py-3.5 rounded-sm text-sm font-bold tracking-wider hover:bg-inverse-surface shadow-xs transition-colors cursor-pointer"
          >
            ค้นหา
          </button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-8 lg:sticky lg:top-24 bg-surface-container-low/30 p-6 rounded-xl border border-outline-variant/20">
            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-bold tracking-widest text-on-surface uppercase mb-4 pb-2 border-b border-outline-variant/30 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">category</span>
                หมวดหมู่หนังสือ
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/books"
                    className={`flex items-center justify-between text-sm px-2 py-1.5 rounded-sm transition-all duration-200 ${!categorySlug ? "bg-secondary/10 text-secondary font-bold" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"}`}
                  >
                    <span>ทั้งหมด</span>
                  </Link>
                </li>
                {allCategories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/books?category=${cat.slug}`}
                      className={`flex items-center justify-between text-sm px-2 py-1.5 rounded-sm transition-all duration-200 ${categorySlug === cat.slug ? "bg-secondary/10 text-secondary font-bold" : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"}`}
                    >
                      <span>{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="text-xs font-bold tracking-widest text-on-surface uppercase mb-4 pb-2 border-b border-outline-variant/30 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">payments</span>
                ช่วงราคา
              </h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href={`/books?${categorySlug ? `category=${categorySlug}&` : ""}maxPrice=300`}
                    className="block text-sm text-on-surface-variant hover:text-primary py-1.5 px-2 hover:bg-surface-container-low rounded-sm transition-all duration-200"
                  >
                    ต่ำกว่า ฿300
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/books?${categorySlug ? `category=${categorySlug}&` : ""}minPrice=300&maxPrice=500`}
                    className="block text-sm text-on-surface-variant hover:text-primary py-1.5 px-2 hover:bg-surface-container-low rounded-sm transition-all duration-200"
                  >
                    ฿300 - ฿500
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/books?${categorySlug ? `category=${categorySlug}&` : ""}minPrice=500`}
                    className="block text-sm text-on-surface-variant hover:text-primary py-1.5 px-2 hover:bg-surface-container-low rounded-sm transition-all duration-200"
                  >
                    ฿500 ขึ้นไป
                  </Link>
                </li>
              </ul>
            </div>
          </aside>

          {/* Book Grid */}
          <div className="lg:col-span-9">
            {/* Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-outline-variant/20">
              <div className="flex flex-wrap gap-2">
                {categorySlug && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 border border-secondary/20 rounded-full text-xs font-bold tracking-wide text-secondary">
                    {currentCategory?.name}
                    <Link href="/books" className="hover:text-error transition-colors flex items-center">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </Link>
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">เรียงลำดับ:</span>
                <div className="flex bg-surface-container-low p-1 rounded-sm border border-outline-variant/20">
                  <Link
                    href={`/books?${categorySlug ? `category=${categorySlug}&` : ""}${search ? `search=${search}&` : ""}sort=newest`}
                    className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all duration-200 ${sort === "newest" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-primary"}`}
                  >
                    ใหม่ล่าสุด
                  </Link>
                  <Link
                    href={`/books?${categorySlug ? `category=${categorySlug}&` : ""}${search ? `search=${search}&` : ""}sort=price-asc`}
                    className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all duration-200 ${sort === "price-asc" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-primary"}`}
                  >
                    ราคาต่ำ-สูง
                  </Link>
                  <Link
                    href={`/books?${categorySlug ? `category=${categorySlug}&` : ""}${search ? `search=${search}&` : ""}sort=price-desc`}
                    className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all duration-200 ${sort === "price-desc" ? "bg-primary text-on-primary shadow-xs" : "text-on-surface-variant hover:text-primary"}`}
                  >
                    ราคาสูง-ต่ำ
                  </Link>
                </div>
              </div>
            </div>

            {bookList.length === 0 ? (
              <div className="text-center py-24 bg-surface-container-lowest rounded-xl border border-outline-variant/30">
                <span className="material-symbols-outlined text-6xl text-outline-variant/80 mb-4 select-none">
                  search_off
                </span>
                <p className="text-lg font-semibold text-on-surface">
                  ไม่พบหนังสือที่ตรงกับการค้นหาของคุณ
                </p>
                <p className="text-sm text-on-surface-variant mt-1">
                  ลองระบุคีย์เวิร์ดกว้างขึ้นหรือกรองหมวดหมู่อื่น
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                {bookList.map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              basePath="/books"
              searchParams={
                Object.fromEntries(
                  Object.entries(params).filter(
                    ([k, v]) => k !== "page" && v !== undefined
                  )
                ) as Record<string, string>
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
