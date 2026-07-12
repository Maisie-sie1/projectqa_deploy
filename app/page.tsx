import { db } from "@/lib/db";
import { books, categories } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BookCard from "./components/BookCard";
import Link from "next/link";

export default async function HomePage() {
  // Fetch featured best seller
  const [featured] = await db
    .select()
    .from(books)
    .where(eq(books.isBestSeller, true))
    .orderBy(desc(books.createdAt))
    .limit(1);

  // Fetch new arrivals
  const newArrivals = await db
    .select()
    .from(books)
    .orderBy(desc(books.createdAt))
    .limit(8); // Show more books for a richer layout

  // Fetch categories
  const allCategories = await db.select().from(categories);

  return (
    <>
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section with Elegant Gradient & Floating Book */}
        {featured && (
          <section className="relative overflow-hidden bg-gradient-to-br from-surface-container-low via-surface-container-lowest to-background py-16 md:py-24 border-b border-outline-variant/20">
            <div className="absolute top-0 right-0 -w-96 -h-96 bg-secondary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary-container/5 rounded-full blur-3xl -z-10" />
            
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text Area */}
              <div className="lg:col-span-7 flex flex-col items-start space-y-6 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold tracking-widest uppercase animate-pulse">
                  <span className="material-symbols-outlined text-xs">workspace_premium</span>
                  หนังสือยอดนิยมประจำเดือน
                </div>
                <h1 className="font-serif text-5xl md:text-6xl font-extrabold text-on-background leading-[1.1] tracking-tight">
                  {featured.title}
                </h1>
                <p className="text-sm font-semibold tracking-wide text-on-surface-variant/80">
                  เขียนโดย <span className="text-secondary font-bold">{featured.author}</span>
                </p>
                <p className="text-lg text-on-surface-variant leading-relaxed max-w-2xl">
                  {featured.description || "เปิดประสบการณ์การอ่านแนวใหม่ที่คุณไม่เคยสัมผัส ร่วมสำรวจมุมมองใหม่ๆ ไปกับหนังสือที่ได้รับความนิยมสูงสุดในขณะนี้"}
                </p>
                
                <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link
                    href={`/books/${featured.id}`}
                    className="bg-primary text-on-primary text-center px-8 py-4 rounded-sm text-sm font-bold tracking-wider hover:bg-inverse-surface shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                  >
                    <span>สั่งซื้อตอนนี้ — ฿{featured.price.toLocaleString()}</span>
                    <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                      arrow_right_alt
                    </span>
                  </Link>
                  <Link
                    href="/books"
                    className="bg-transparent border border-outline-variant hover:border-primary text-on-surface text-center px-8 py-4 rounded-sm text-sm font-bold tracking-wider hover:bg-surface-container-low transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>สำรวจหน้าร้าน</span>
                  </Link>
                </div>
              </div>

              {/* Cover Image Area with 3D shadow and glow */}
              <div className="lg:col-span-5 flex justify-center order-1 lg:order-2">
                <div className="relative group">
                  <div className="absolute inset-0 bg-secondary/10 rounded-sm blur-2xl group-hover:bg-secondary/20 transition-all duration-500 transform scale-95" />
                  <Link href={`/books/${featured.id}`} className="block relative z-10 transition-transform duration-500 hover:scale-[1.03]">
                    {featured.coverImage ? (
                      <img
                        src={featured.coverImage}
                        alt={featured.title}
                        className="w-64 md:w-80 object-cover book-shadow rounded-sm border border-outline-variant/30"
                      />
                    ) : (
                      <div className="w-64 md:w-80 aspect-[3/4] bg-surface-container flex items-center justify-center rounded-sm book-shadow">
                        <span className="material-symbols-outlined text-8xl text-on-surface-variant/40">
                          menu_book
                        </span>
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categories Section with Premium Glass Card Design */}
        {allCategories.length > 0 && (
          <section className="py-16 bg-surface">
            <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-on-surface">
                  ค้นพบหนังสือตามหมวดหมู่
                </h2>
                <div className="w-12 h-1 bg-secondary mx-auto mt-4 rounded-full" />
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {allCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/books?category=${cat.slug}`}
                    className="group relative flex flex-col items-center justify-center p-8 bg-surface-container-lowest border border-outline-variant/20 rounded-lg hover:border-secondary/40 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="w-16 h-16 rounded-full bg-secondary/5 flex items-center justify-center mb-4 group-hover:bg-secondary/15 transition-colors duration-300">
                      <span className="material-symbols-outlined text-3xl text-secondary group-hover:scale-110 transition-transform duration-300">
                        {cat.icon}
                      </span>
                    </div>
                    <span className="text-base font-bold text-on-surface text-center group-hover:text-secondary transition-colors">
                      {cat.name}
                    </span>
                    <p className="text-xs text-on-surface-variant text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-[180px]">
                      {cat.description || `สำรวจหนังสือในหมวดหมู่ ${cat.name}`}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* New Arrivals with Luxury Presentation */}
        <section className="py-16 md:py-24 bg-surface-container-lowest">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 pb-6 border-b border-outline-variant/30">
              <div>
                <span className="text-xs font-bold text-secondary tracking-widest uppercase">
                  Curated Catalog
                </span>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-on-surface mt-2">
                  หนังสือมาใหม่ล่าสุด
                </h2>
              </div>
              <Link
                href="/books"
                className="inline-flex items-center gap-1 text-sm font-bold text-secondary hover:text-primary mt-4 sm:mt-0 transition-colors duration-200 group"
              >
                <span>ดูหนังสือทั้งหมด</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
              {newArrivals.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>

        {/* Luxury Editorial Quote Section */}
        <section className="py-20 bg-primary text-on-primary text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(254,166,25,0.08)_0%,transparent_70%)]" />
          <div className="max-w-3xl mx-auto px-margin-mobile relative z-10">
            <span className="material-symbols-outlined text-secondary text-5xl mb-6 select-none">
              format_quote
            </span>
            <p className="font-serif text-2xl md:text-3xl italic leading-relaxed font-light mb-8">
              "การอ่านหนังสือที่ดีสักเล่ม ไม่เพียงแต่ได้ความรู้ แต่เป็นการเปิดประตูจิตวิญญาณสู่การผจญภัยอันไม่มีที่สิ้นสุด"
            </p>
            <div className="w-8 h-0.5 bg-secondary mx-auto mb-4" />
            <p className="text-xs uppercase tracking-widest text-secondary font-bold">
              Lumina Editor's Choice
            </p>
          </div>
        </section>

        {/* Premium Newsletter Sign-up */}
        <section className="py-20 bg-surface">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="relative overflow-hidden bg-gradient-to-r from-surface-container-low to-surface-container-lowest rounded-2xl p-8 md:p-16 border border-outline-variant/30 shadow-xs max-w-4xl mx-auto">
              <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
              
              <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
                <span className="material-symbols-outlined text-secondary text-4xl mb-4">
                  mail
                </span>
                <h2 className="font-serif text-3xl font-bold text-on-surface mb-3">
                  รับแรงบันดาลใจในการอ่านทุกสัปดาห์
                </h2>
                <p className="text-base text-on-surface-variant mb-8">
                  ร่วมเป็นส่วนหนึ่งของคอมมูนิตี้นักอ่านตัวจริง รับบทความรีวิวหนังสือเข้าใหม่ และส่วนลดพิเศษเฉพาะสมาชิกก่อนใคร
                </p>
                <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                  <input
                    className="px-4 py-3 rounded-sm border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary w-full transition-colors placeholder:text-outline/80"
                    placeholder="กรอกอีเมลของคุณเพื่อสมัครสมาชิก"
                    type="email"
                    required
                  />
                  <button
                    type="submit"
                    className="bg-primary text-on-primary px-8 py-3 rounded-sm text-sm font-bold tracking-wider hover:bg-inverse-surface transition-all duration-300 whitespace-nowrap shadow-md cursor-pointer"
                  >
                    สมัครรับข่าวสาร
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
