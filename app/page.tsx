import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Target, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30 flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -z-10 opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -z-10 opacity-20 pointer-events-none" />

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-neutral-900/50 backdrop-blur-xl py-4 sticky top-0 z-50">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <span className="text-2xl font-black italic tracking-tighter text-white flex items-center gap-2">
            WE UP
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          </span>
          <Link href="/auth/signin">
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center container mx-auto px-6 py-24 text-center animate-fade-up">
        <div className="max-w-4xl space-y-10 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs md:text-sm font-bold uppercase tracking-wide backdrop-blur-sm">
            <Shield className="w-3 h-3 md:w-4 md:h-4" />
            Rapid Deployable PRM
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tight leading-[0.95] md:leading-[0.9] drop-shadow-2xl">
            STAY ON<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400">
              YOUR FEET.
            </span>
          </h1>

          <p className="text-lg md:text-2xl text-zinc-400 font-medium max-w-xl md:max-w-2xl mx-auto leading-relaxed px-4">
            Be consistent. Be reliable.
            <br />
            <span className="text-zinc-500">The tool for managing your team, your goals, and your comeback.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-8 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 md:h-14 px-8 text-base md:text-lg font-bold rounded-full bg-white text-neutral-900 hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95">
                Launch Dashboard <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid md:grid-cols-3 gap-6 mt-32 text-left max-w-6xl mx-auto w-full px-4">
          <div className="p-8 rounded-3xl bg-neutral-900/50 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-colors group">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Goal Engine</h3>
            <p className="text-zinc-500 leading-relaxed">Track your wins. From getting your ID to landing that job. Visualize your progress with resilience data.</p>
          </div>

          <div className="p-8 rounded-3xl bg-neutral-900/50 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-colors group">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">My Team</h3>
            <p className="text-zinc-500 leading-relaxed">Manage your squad. Keep your lifelines close and your network growing. Never lose a contact again.</p>
          </div>

          <div className="p-8 rounded-3xl bg-neutral-900/50 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-colors group">
            <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 text-white">Rapid Deployable</h3>
            <p className="text-zinc-500 leading-relaxed">No complex setup. No barriers. Just instant access to vouchers, receipts, and the tools you need.</p>
          </div>
        </div>

      </div>

      {/* Footer minimal */}
      <footer className="py-8 text-center text-zinc-800 text-sm font-mono uppercase tracking-widest">
        We Up © 2026
      </footer>
    </div>
  );
}
