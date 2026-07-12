import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import BookForm from "../BookForm";

export default async function NewBookPage() {
  const allCategories = await db.select().from(categories);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-on-surface mb-8">
        เพิ่มหนังสือใหม่
      </h1>
      <BookForm categories={allCategories} />
    </div>
  );
}
