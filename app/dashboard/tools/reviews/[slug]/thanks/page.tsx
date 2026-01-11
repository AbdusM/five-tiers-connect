import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusiness, businesses } from "@/lib/features/reviews/data/businesses";
import { ShareButtons } from "@/components/features/reviews/ShareButtons";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(businesses).map((slug) => ({ slug }));
}

export default async function ThanksPage({ params }: PageProps) {
  const { slug } = await params;
  const business = getBusiness(slug);

  if (!business) {
    notFound();
  }

  return (
    <main className="min-h-screen flex items-center justify-center py-10 px-4">
      <div className="max-w-md mx-auto text-center animate-fade-up">
        {/* Success Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl mx-auto flex items-center justify-center text-5xl shadow-xl shadow-green-500/20">
            ✓
          </div>
          {/* Confetti dots */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 pointer-events-none">
            <span className="absolute top-2 left-4 w-2 h-2 bg-amber-400 rounded-full opacity-60"></span>
            <span className="absolute top-4 right-6 w-1.5 h-1.5 bg-pink-400 rounded-full opacity-60"></span>
            <span className="absolute bottom-4 left-2 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60"></span>
            <span className="absolute bottom-2 right-4 w-2 h-2 bg-purple-400 rounded-full opacity-60"></span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold mb-2">Thanks for the love!</h1>
        <p className="text-zinc-400 mb-8">
          Your review helps others discover{" "}
          <span className="text-white">{business.name}</span>
        </p>

        {/* Share Section */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <p className="text-sm text-zinc-400 mb-1">
            Know someone who&apos;d love them?
          </p>
          <p className="text-xs text-zinc-600 mb-5">Share and spread the word</p>
          <ShareButtons businessName={business.name} slug={slug} />
        </div>

        {/* Back Link */}
        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition text-sm"
        >
          <span>←</span>
          Back to {business.name}
        </Link>
      </div>
    </main>
  );
}
