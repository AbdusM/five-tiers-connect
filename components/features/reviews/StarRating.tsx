interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
}

export function StarRating({ rating, size = "md" }: StarRatingProps) {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-xl",
    lg: "text-2xl",
  };

  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className={`flex items-center gap-0.5 ${sizeClasses[size]}`}>
      {[...Array(5)].map((_, i) => (
        <span
          key={i}
          className={
            i < fullStars
              ? "text-amber-400"
              : i === fullStars && hasHalf
              ? "text-amber-400/50"
              : "text-zinc-600"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}
