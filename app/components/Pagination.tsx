import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildUrl(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="mt-16 flex justify-center items-center gap-2">
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </Link>
      ) : (
        <button
          disabled
          className="w-10 h-10 flex items-center justify-center rounded-full text-outline-variant cursor-not-allowed"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
      )}

      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="text-on-surface-variant mx-1">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={buildUrl(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold tracking-wide transition-colors ${
              page === currentPage
                ? "bg-primary text-on-primary"
                : "text-on-surface hover:bg-surface-container"
            }`}
          >
            {page}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      ) : (
        <button
          disabled
          className="w-10 h-10 flex items-center justify-center rounded-full text-outline-variant cursor-not-allowed"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      )}
    </div>
  );
}
