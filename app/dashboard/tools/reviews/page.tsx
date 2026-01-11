import Link from "next/link";
import { businesses } from "@/lib/features/reviews/data/businesses";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-up">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            Review<span className="text-amber-400">Drop</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            LinkTree for reviews. Show off your best, collect more.
          </p>
        </div>

        {/* Business Grid */}
        <div className="mb-8">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-8 h-px bg-zinc-700"></span>
            Demo Businesses
            <span className="flex-1 h-px bg-zinc-700"></span>
          </h2>

          <div className="grid gap-3 stagger-children">
            {Object.entries(businesses).map(([slug, business]) => (
              <Link
                key={slug}
                href={`/${slug}`}
                className={`
                  group flex items-center gap-4 p-4
                  bg-zinc-900 rounded-xl border border-zinc-800
                  hover:border-zinc-700 hover:-translate-y-0.5
                  transition-all duration-200
                `}
              >
                <div
                  className={`w-12 h-12 gradient-${business.accentColor} rounded-xl flex items-center justify-center text-2xl shadow-lg`}
                >
                  {business.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {business.name}
                  </p>
                  <p className="text-zinc-500 text-sm truncate">
                    {business.tagline}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-amber-400 font-semibold">
                    {business.rating} ★
                  </p>
                  <p className="text-zinc-600 text-xs">
                    {business.reviewCount} reviews
                  </p>
                </div>
                <span className="text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass-card rounded-2xl p-6 text-center">
          <p className="text-zinc-400 mb-4">
            Want this for your business?
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all">
            Get Started Free →
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-xs mt-10">
          Built with Next.js + Tailwind
        </p>
      </div>
    </main>
  );
}
