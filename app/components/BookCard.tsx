import Link from "next/link";
import StarRating from "./StarRating";
import AddToCartButton from "./AddToCartButton";

interface BookCardProps {
  book: {
    id: number;
    title: string;
    author: string;
    price: number;
    originalPrice?: number | null;
    coverImage?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
    isBestSeller?: boolean;
  };
  showCartButton?: boolean;
}

export default function BookCard({
  book,
  showCartButton = true,
}: BookCardProps) {
  return (
    <article className="group cursor-pointer flex flex-col relative">
      <Link href={`/books/${book.id}`} className="block">
        <div className="bg-surface-container-lowest p-6 rounded-lg mb-4 flex justify-center aspect-[3/4] items-center relative overflow-hidden transition-transform duration-300 group-hover:-translate-y-1">
          {book.coverImage ? (
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-contain book-shadow"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl">
                menu_book
              </span>
            </div>
          )}
          
          {book.isBestSeller && (
            <div className="absolute top-2 left-2 bg-secondary-container text-on-secondary-container px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm z-10">
              Best Seller
            </div>
          )}

          {showCartButton && (
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <AddToCartButton bookId={book.id} variant="overlay" />
            </div>
          )}
        </div>
      </Link>

      <Link href={`/books/${book.id}`}>
        <h3 className="font-serif text-2xl font-semibold text-on-surface mb-1 truncate group-hover:text-secondary transition-colors">
          {book.title}
        </h3>
      </Link>
      <p className="text-base text-on-surface-variant mb-2 truncate">{book.author}</p>
      
      {book.rating !== undefined && book.rating !== null && book.rating > 0 && (
        <div className="flex items-center gap-1 mb-2">
          <StarRating rating={book.rating} size="text-[14px]" />
          {book.reviewCount !== undefined && book.reviewCount !== null && (
            <span className="text-xs text-on-surface-variant ml-1">
              ({book.reviewCount})
            </span>
          )}
        </div>
      )}

      <div className="flex items-baseline gap-2 mt-auto">
        <span className="text-sm font-semibold tracking-wide text-secondary">
          ฿{book.price.toLocaleString()}
        </span>
        {book.originalPrice && book.originalPrice > book.price && (
          <span className="text-xs text-outline line-through">
            ฿{book.originalPrice.toLocaleString()}
          </span>
        )}
      </div>
    </article>
  );
}
