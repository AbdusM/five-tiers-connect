import { Review } from "@/lib/features/reviews/data/businesses";
import { StarRating } from "./StarRating";

interface ReviewCardProps {
  review: Review;
}

const platformConfig: Record<string, { icon: string; color: string }> = {
  google: { icon: "G", color: "text-blue-400" },
  yelp: { icon: "Y", color: "text-red-400" },
  facebook: { icon: "f", color: "text-blue-500" },
  instagram: { icon: "IG", color: "text-pink-400" },
};

export function ReviewCard({ review }: ReviewCardProps) {
  const platform = platformConfig[review.platform];

  return (
    <div className="glass-card rounded-2xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400">
            {review.author.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white text-sm">{review.author}</p>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-zinc-600 text-xs">·</span>
              <span className="text-zinc-500 text-xs">{review.date}</span>
            </div>
          </div>
        </div>
        {/* Platform badge */}
        <span
          className={`text-xs font-bold ${platform?.color || "text-zinc-400"}`}
        >
          {platform?.icon}
        </span>
      </div>
      <p className="text-zinc-300 text-sm leading-relaxed pl-13">
        &ldquo;{review.text}&rdquo;
      </p>
    </div>
  );
}
