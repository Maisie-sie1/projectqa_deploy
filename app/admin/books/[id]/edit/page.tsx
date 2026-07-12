import { db } from "@/lib/db";
import { books, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import BookForm from "../../BookForm";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const book = await db.query.books.findFirst({
    where: eq(books.id, Number(id)),
  });

  if (!book) notFound();

  const allCategories = await db.select().from(categories);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-8">
        แก้ไขหนังสือ
      </h1>
      <BookForm categories={allCategories} book={book} />
    </div>
  );
}
