import { db } from "@/lib/db";
import { books, categories } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import DeleteBookButton from "./DeleteBookButton";

export default async function AdminBooksPage() {
  const bookList = await db.query.books.findMany({
    with: { category: true },
    orderBy: [desc(books.createdAt)],
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-bold text-on-surface">
          จัดการหนังสือ
        </h1>
        <Link
          href="/admin/books/new"
          className="bg-primary text-on-primary px-6 py-3 rounded-sm text-sm font-semibold tracking-wide hover:bg-inverse-surface transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          เพิ่มหนังสือ
        </Link>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container">
                <th className="text-left px-4 py-3 font-semibold tracking-wide text-on-surface-variant">
                  หนังสือ
                </th>
                <th className="text-left px-4 py-3 font-semibold tracking-wide text-on-surface-variant hidden md:table-cell">
                  หมวดหมู่
                </th>
                <th className="text-right px-4 py-3 font-semibold tracking-wide text-on-surface-variant">
                  ราคา
                </th>
                <th className="text-right px-4 py-3 font-semibold tracking-wide text-on-surface-variant hidden md:table-cell">
                  สต็อก
                </th>
                <th className="text-right px-4 py-3 font-semibold tracking-wide text-on-surface-variant">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody>
              {bookList.map((book) => (
                <tr
                  key={book.id}
                  className="border-b border-outline-variant/50 hover:bg-surface-container-low transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 flex-shrink-0 rounded bg-surface-container overflow-hidden">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
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
                        <p className="font-semibold text-on-surface">
                          {book.title}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {book.author}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant hidden md:table-cell">
                    {book.category?.name || "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-on-surface font-semibold">
                    ฿{book.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-on-surface-variant hidden md:table-cell">
                    {book.stock}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/books/${book.id}/edit`}
                        className="p-2 hover:bg-surface-container rounded transition-colors text-on-surface-variant hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-lg">
                          edit
                        </span>
                      </Link>
                      <DeleteBookButton bookId={book.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {bookList.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2">
              library_books
            </span>
            <p>ยังไม่มีหนังสือ</p>
          </div>
        )}
      </div>
    </div>
  );
}
