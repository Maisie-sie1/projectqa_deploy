import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant mt-auto">
      <div className="w-full py-12 px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter max-w-container-max mx-auto">
        <div className="md:col-span-1 mb-8 md:mb-0">
          <span className="font-serif text-xl font-bold text-primary block mb-4">
            Lumina Books
          </span>
          <p className="text-sm text-on-surface-variant">
            © 2024 Lumina Books. Curating the intellectual joy of reading.
          </p>
        </div>

        <div className="md:col-span-3 flex flex-wrap gap-x-12 gap-y-4 md:justify-end">
          <Link
            href="/books"
            className="text-sm font-semibold tracking-wide text-on-surface-variant hover:text-secondary transition-colors duration-200"
          >
            Browse Collection
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold tracking-wide text-on-surface-variant hover:text-secondary transition-colors duration-200"
          >
            Our Story
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold tracking-wide text-on-surface-variant hover:text-secondary transition-colors duration-200"
          >
            Shipping Policy
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold tracking-wide text-on-surface-variant hover:text-secondary transition-colors duration-200"
          >
            Privacy
          </Link>
          <Link
            href="/"
            className="text-sm font-semibold tracking-wide text-on-surface-variant hover:text-secondary transition-colors duration-200"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  );
}
