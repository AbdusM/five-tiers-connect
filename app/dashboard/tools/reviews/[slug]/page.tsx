import { notFound } from "next/navigation";
import { getBusiness, businesses } from "@/lib/features/reviews/data/businesses";
import { StarRating } from "@/components/features/reviews/StarRating";
import { ReviewCard } from "@/components/features/reviews/ReviewCard";
import { ReviewButton } from "@/components/features/reviews/ReviewButton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(businesses).map((slug) => ({ slug }));
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getBusiness(slug);

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-up">
          <div
            className={`w-24 h-24 gradient-${business.accentColor} glow-${business.accentColor} rounded-2xl mx-auto mb-5 flex items-center justify-center text-4xl shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300`}
          >
            {business.emoji}
          </div>
          <h1 className="text-2xl font-bold mb-2 tracking-tight">
            {business.name}
          </h1>
          <p className="text-zinc-400 text-sm mb-4">{business.tagline}</p>
          <div className="flex items-center justify-center gap-2">
            <StarRating rating={business.rating} size="md" />
            <span className="text-zinc-500 text-sm font-medium">
              {business.rating} ({business.reviewCount})
            </span>
          </div>
        </div>

        {/* Featured Reviews */}
        <div className="mb-10">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-8 h-px bg-zinc-700"></span>
            What people say
            <span className="flex-1 h-px bg-zinc-700"></span>
          </h2>
          <div className="flex flex-col gap-3 stagger-children">
            {business.featuredReviews.map((review, index) => (
              <ReviewCard key={index} review={review} />
            ))}
          </div>
        </div>

        {/* Leave Review Buttons */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-8 h-px bg-zinc-700"></span>
            Leave a review
            <span className="flex-1 h-px bg-zinc-700"></span>
          </h2>
          <div className="flex flex-col gap-3 stagger-children">
            {Object.entries(business.links).map(([platform, url]) => (
              <ReviewButton
                key={platform}
                platform={platform}
                href={url}
                slug={slug}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-xs">
          Powered by <span className="text-zinc-500">ReviewDrop</span>
        </p>
      </div>
    </main>
  );
}
