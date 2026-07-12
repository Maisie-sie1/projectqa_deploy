export default function StarRating({
  rating,
  size = "text-base",
}: {
  rating: number;
  size?: string;
}) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: fullStars }).map((_, i) => (
        <span
          key={`full-${i}`}
          className={`material-symbols-outlined ${size} text-secondary`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star
        </span>
      ))}
      {hasHalf && (
        <span
          className={`material-symbols-outlined ${size} text-secondary`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star_half
        </span>
      )}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span
          key={`empty-${i}`}
          className={`material-symbols-outlined ${size} text-outline`}
        >
          star
        </span>
      ))}
    </div>
  );
}
