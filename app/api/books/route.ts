import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { books, categories } from "@/lib/db/schema";
import { eq, and, or, ilike, gte, lte, asc, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const minPriceStr = searchParams.get("minPrice");
    const maxPriceStr = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";

    const conditions = [];

    // Filter by category (either ID or Slug)
    if (category) {
      if (/^\d+$/.test(category)) {
        conditions.push(eq(books.categoryId, parseInt(category, 10)));
      } else {
        // Query by category slug
        const [cat] = await db
          .select({ id: categories.id })
          .from(categories)
          .where(eq(categories.slug, category))
          .limit(1);
        if (cat) {
          conditions.push(eq(books.categoryId, cat.id));
        } else {
          // Non-matching slug should return empty results
          conditions.push(eq(books.categoryId, -1));
        }
      }
    }

    // Filter by search query (match title or author)
    if (search) {
      conditions.push(
        or(
          ilike(books.title, `%${search}%`),
          ilike(books.author, `%${search}%`)
        )
      );
    }

    // Price filters
    if (minPriceStr) {
      const minPrice = parseFloat(minPriceStr);
      if (!isNaN(minPrice)) {
        conditions.push(gte(books.price, minPrice));
      }
    }
    if (maxPriceStr) {
      const maxPrice = parseFloat(maxPriceStr);
      if (!isNaN(maxPrice)) {
        conditions.push(lte(books.price, maxPrice));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sorting
    let orderBy = desc(books.createdAt);
    if (sort === "price-asc") {
      orderBy = asc(books.price);
    } else if (sort === "price-desc") {
      orderBy = desc(books.price);
    } else if (sort === "rating") {
      orderBy = desc(books.rating);
    }

    const bookList = await db
      .select()
      .from(books)
      .where(whereClause)
      .orderBy(orderBy);

    return Response.json(bookList);
  } catch (e: any) {
    return Response.json({ error: e.message || "เกิดข้อผิดพลาดในการดึงข้อมูลหนังสือ" }, { status: 500 });
  }
}
